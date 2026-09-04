import https from 'node:https';

// Config do voucher do Clube Deep (baseado na doc TOTVS Moda Voucher v2)
const PADRAO = {
  baseUrl: process.env.TOTVS_BASE_URL || 'https://www30.bhan.com.br:9443/api/totvsmoda/',
  prefix: 'CLUBE',            // TOTVS limita prefixCode a 6 caracteres
  printTemplate: 5,
  branchRegistrationVoucher: 1,   // loja que registra o voucher PAI
  branchRegistrationCustomer: 1,  // loja que emite o voucher FILHO
  branchs: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], // empresas onde vale
  minimoCompra: 2500,             // triggers: compra minima
};

function cred() {
  return {
    clientId: process.env.TOTVS_CLIENT_ID || 'deepapiv2',
    clientSecret: process.env.TOTVS_CLIENT_SECRET || '4270929817',
    username: process.env.TOTVS_USERNAME || 'ECOMM',
    password: process.env.TOTVS_PASSWORD || '1995',
  };
}

function req(base, method, path, opts = {}) {
  const url = new URL(path, base.endsWith('/') ? base : base + '/');
  const headers = { Accept: 'application/json' };
  let body;
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.form) { body = new URLSearchParams(opts.form).toString(); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
  else if (opts.json !== undefined) { body = JSON.stringify(opts.json); headers['Content-Type'] = 'application/json'; }
  return new Promise((resolve, reject) => {
    // rejectUnauthorized:false -> o endpoint :9443 usa certificado interno
    const r = https.request(url, { method, headers, rejectUnauthorized: false, timeout: 90000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const status = res.statusCode || 0;
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : null; } catch { parsed = data; }
        if (status >= 200 && status < 300) resolve(parsed);
        else reject(new Error(`TOTVS ${status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`));
      });
    });
    r.on('error', reject);
    r.on('timeout', () => r.destroy(new Error('TOTVS timeout')));
    if (body) r.write(body);
    r.end();
  });
}

async function token(cfg) {
  const c = cred();
  const j = await req(cfg.baseUrl, 'POST', 'authorization/v2/token', {
    form: { Grant_type: 'password', Client_id: c.clientId, Client_secret: c.clientSecret, Username: c.username, Password: c.password },
  });
  return j.access_token;
}

// Gera o voucher (pai) + a copia do cliente (filho). Retorna os 3 identificadores.
export async function gerarVoucher({ valor, cdCliente, nome, endDate }) {
  const cfg = PADRAO;
  const t = await token(cfg);
  const agora = new Date();
  const fim = endDate ? new Date(endDate) : new Date(agora.getTime() + 30 * 864e5);
  const descricao = `CLUBE DEEP - ${nome || 'Cliente'}`.slice(0, 100);

  // 1) voucher PAI
  const pai = await req(cfg.baseUrl, 'POST', 'voucher/v2/create', {
    token: t,
    json: {
      branchCodeRegistration: cfg.branchRegistrationVoucher,
      description: descricao,
      voucherType: 1,                    // desconto — NAO enviar quantity
      prefixCode: cfg.prefix,
      printTemplateCode: cfg.printTemplate,
      status: 1,
      startDate: agora.toISOString(),
      endDate: fim.toISOString(),
      value: valor,
      branchs: cfg.branchs.map((b) => ({ branchCode: b })),
      triggers: [ { triggerType: 2, operationType: 4, value: cfg.minimoCompra } ],
    },
  });
  const voucherNumberPai = pai?.voucherNumber;
  if (!voucherNumberPai) throw new Error('TOTVS nao retornou voucherNumber (pai)');

  // 2) voucher FILHO (nominal ao cliente, por personCode)
  const vinc = await req(cfg.baseUrl, 'POST', 'voucher/v2/customer/create', {
    token: t,
    json: {
      branchCodeRegistration: cfg.branchRegistrationCustomer,
      voucherNumberBase: voucherNumberPai,
      customerCodeList: [Number(cdCliente)],
    },
  });
  const item = vinc?.items?.[0];
  if (!item?.voucherCode) throw new Error('TOTVS nao retornou voucherCode (filho)');

  return {
    codigo: item.voucherCode,
    voucherNumber: item.voucherNumber,
    voucherNumberPai,
    validoAte: fim.toISOString(),
  };
}

// Cancela o par (filho + pai). Ja cancelado conta como sucesso.
export async function cancelarVoucher({ voucherNumber, voucherNumberPai }) {
  const cfg = PADRAO;
  const t = await token(cfg);
  const numeros = [voucherNumber, voucherNumberPai].filter((n) => typeof n === 'number');
  for (const n of numeros) {
    try {
      await req(cfg.baseUrl, 'POST', 'voucher/v2/update', { token: t, json: { voucherNumber: n, status: 6 } });
    } catch (e) {
      if (!String(e.message).toLowerCase().includes('not allowed')) throw e; // ja cancelado = ok
    }
  }
  return { cancelados: numeros };
}
