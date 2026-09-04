# Clube DEEP — Roteiro de Testes e Validação

Documento para validar o Clube DEEP ponta a ponta e conferir cada regra contra o Documento Oficial v4.
Marque cada item com `[x]` conforme for testando.

---

## 1. Logins de teste (um por nível)

Criei os mapeamentos de acesso no Supabase (tabela `painel_acessos`). Cada e-mail já está ligado a um cliente real daquele nível.

| Nível | E-mail de login | Cliente | Pontos | Login já existe? |
|---|---|---|---|---|
| **Sem nível** | `teste.semnivel@grupodeep.com.br` | MONICA ANDRADE (14567) | 510 | criar |
| **Bronze** | `teste.bronze@grupodeep.com.br` | MARIA TANIZA (588) | 29.672 | criar |
| **Prata** | `teste.prata@grupodeep.com.br` | CLAUDIA CRISTINA (230) | 45.834 | criar |
| **Ouro** | `clienteouro@grupodeep.com.br` | KARINY (981) | 60.675 | **já existe** |
| **Platina** | `teste.platina@grupodeep.com.br` | R C LIMA (20614) | 140.554 | criar |

### O que você precisa fazer (criar as senhas)
Por segurança eu não crio logins com senha. Crie os 4 novos no Supabase (o de Ouro já existe):

1. Supabase → projeto **ClubeDeep** → **Authentication** → **Users** → **Add user**.
2. Preencha o **e-mail exatamente** como está na tabela acima.
3. Defina uma senha à sua escolha e marque **Auto Confirm User**.
4. Repita para os 4 e-mails novos (semnivel, bronze, prata, platina).

Pronto — o mapeamento de nível já está feito, então ao logar cada um cai direto na área do cliente do nível certo.

### Segundo acesso da Kelma
Removi o mapeamento `teste@grupodeep.com.br` (Kelma / cd 1001) da `painel_acessos`. O login de autenticação em si ainda existe em **Authentication → Users**; se quiser sumir de vez, apague por lá. Sem o mapeamento, mesmo logando ele cai em "acesso negado".

---

## 2. Voucher do mês — resgatar em cada nível

> Regra oficial: voucher **Prata R$ 100 · Ouro R$ 200 · Platina R$ 500**, com **compra mínima de R$ 2.500** liberada via gatilho na TOTVS. Bronze e "sem nível" **não têm** voucher.

- [ ] **Sem nível / Bronze**: o card de voucher **não** aparece (ou aparece sem botão de resgate).
- [ ] **Prata**: resgatar → aparece código, valor **R$ 100**, botão de copiar funciona.
- [ ] **Ouro**: resgatar → código, valor **R$ 200**.
- [ ] **Platina**: resgatar → código, valor **R$ 500**.
- [ ] Clicar duas vezes rápido **não** gera dois vouchers (proteção anti-duplo-clique).
- [ ] Após resgatar, o voucher do mês fica travado (não deixa resgatar de novo no mesmo período).
- [ ] O voucher aparece no **histórico** do card.
- [ ] Conferir na **TOTVS** que o voucher foi criado com a descrição **"CLUBE DEEP - <NOME DO CLIENTE>"**, emitido na **loja 1**, válido nas lojas 1 a 20.
- [ ] Testar uma compra **abaixo de R$ 2.500** e confirmar que o voucher **não** é aplicado (gatilho de mínimo).
- [ ] Testar uma compra **≥ R$ 2.500** e confirmar que o desconto é aplicado.

---

## 3. Liberação de cursos (DEEP Educa) por nível

> Regra oficial: 4 trilhas, uma por nível, desbloqueio **acumulativo**. Bronze abre a Trilha Bronze (5 aulas); ao subir, mantém as anteriores e ganha a nova; no Platina tem acesso completo (**11 aulas no total**). O vídeo de Apresentação de Coleção é liberado para todos.

Cadastro atual no banco:

| Trilha | Nível mínimo | Aulas cadastradas |
|---|---|---|
| Trilha Bronze | bronze | 5 |
| Trilha Prata | prata | 2 |
| Trilha Ouro | ouro | 2 |
| Trilha Platina | platina | 2 |

- [ ] **Sem nível**: página de cursos mostra "Acesso liberado a partir do Bronze" (nenhuma trilha acessível).
- [ ] **Bronze**: vê Trilha Bronze liberada; Prata/Ouro/Platina aparecem em cinza com 🔒 "Disponível ao atingir o nível X".
- [ ] **Prata**: vê Bronze **e** Prata liberadas; Ouro/Platina bloqueadas.
- [ ] **Ouro**: vê Bronze, Prata **e** Ouro; Platina bloqueada.
- [ ] **Platina**: vê **todas** as trilhas liberadas.
- [ ] Abrir uma aula, assistir e confirmar que o **progresso** é salvo (marca como concluída e a barra avança).
- [ ] Confirmar que o player **não mostra o link do YouTube** para o cliente.

### ⚠️ Pontos a reconciliar com o documento (revisar com o comercial)
- [ ] Número de aulas de **Prata, Ouro e Platina** está com 2 cada (placeholder). O documento fala em **11 aulas no total** — hoje soma 5+2+2+2 = 11, mas confirmar a distribuição correta por trilha.
- [ ] Existem cursos placeholder no Bronze: **"Em breve" (4 aulas)** e **"Apresentacao de Colecao" (0 aulas)**. Definir se entram, viram o vídeo mensal de coleção, ou são removidos.
- [ ] Os **links das aulas** serão colocados pelo comercial — validar quando estiverem no ar.

---

## 4. Benefícios por nível

> Regra oficial: cada nível tem sua lista de benefícios; desbloqueio acumulativo por nível; textos oficiais do documento. Periodicidade pode ser **único**, **mensal** ou **anual**.

Cadastro atual no banco:

| Nível | Benefício | Periodicidade |
|---|---|---|
| Bronze | Pontos de Boas-Vindas | único |
| Bronze | DEEP Educa Bronze | único |
| Bronze | Apresentação de Coleção | mensal |
| Prata | Kit Exclusivo Prata | único |
| Prata | DEEP Educa Prata | único |
| Prata | Apresentação de Coleção | mensal |
| Prata | Desconto por Prazo de Pagamento | único |
| Ouro | Kit Exclusivo Ouro | único |
| Ouro | DEEP Educa Ouro | único |
| Ouro | Apresentação de Coleção | mensal |
| Ouro | Desconto por Prazo de Pagamento | único |
| Ouro | Credenciamento Premium em Eventos | único |
| Ouro | Lugar Reservado e Privilegiado em Eventos | único |
| Platina | Kit Exclusivo Platina | único |
| Platina | DEEP Educa Platina | único |
| Platina | Apresentação de Coleção | mensal |
| Platina | Desconto por Prazo de Pagamento | único |
| Platina | VIP em Eventos | único |
| Platina | Ajuda de Custo para Eventos | anual |
| Platina | Look DEEP ou LOE | anual |

- [ ] **Sem nível**: tela mostra "Benefícios liberados a partir do Bronze".
- [ ] **Bronze**: vê os 3 benefícios Bronze; os de Prata/Ouro/Platina aparecem bloqueados (🔒 "Disponível ao atingir X").
- [ ] **Prata**: vê os benefícios do nível Prata; níveis acima bloqueados.
- [ ] **Ouro**: vê os benefícios Ouro; Platina bloqueado.
- [ ] **Platina**: vê todos os benefícios Platina, incluindo os **anuais** (Ajuda de Custo, Look DEEP/LOE).
- [ ] Abrir um benefício e conferir que o **texto/conteúdo** (escrito pelo admin) aparece na página do benefício.
- [ ] Confirmar as **tags de periodicidade** (único / mensal / anual) em cada card.
- [ ] Marcar um resgate (pelo admin/suporte, na ficha do cliente) e confirmar que aparece como **✓ Recebido** e entra no **histórico** do cliente.
- [ ] **Kit Platina**: no login Platina, confirmar o card "Seu kit Platina é personalizado" na tela inicial, com botão de WhatsApp pré-preenchido pedindo a foto.

### ⚠️ Conferir contra o documento
- [ ] Cada **texto de benefício** bate com o texto oficial do v4 (títulos e descrições).
- [ ] A lista de benefícios por nível está **completa** (nenhum benefício do documento faltando).

---

## 5. Motor de pontos (regras v4)

> Regras oficiais: R$ 1 = 1 ponto · mínimo **R$ 2.500** por transação · **+500 boas-vindas** · ticket médio **+400 (≥ R$ 5.300)** e **+800 (≥ R$ 7.700)** · recorrência **+1.000 (3 meses)** e **+3.000 (6 meses)** · validade **180 dias** · carência **15 dias**.

Faixas de nível: **Bronze ≥ 2.500 · Prata > 30.000 · Ouro > 48.000 · Platina > 72.000**.

- [ ] Pegar um cliente e conferir no **extrato** que cada venda ≥ R$ 2.500 gerou pontos = valor da compra.
- [ ] Venda **abaixo de R$ 2.500** não gera pontos.
- [ ] Devolução **desconta** pontos.
- [ ] Bônus de **boas-vindas (+500)** aparece uma vez por cliente.
- [ ] Bônus de **ticket médio** (+400 / +800) aparece nas compras que batem o valor.
- [ ] Bônus de **recorrência** (+1.000 / +3.000) aparece para quem comprou 3 e 6 meses seguidos.
- [ ] Pontos com mais de **180 dias** saem do saldo válido (conferir "a expirar em 30/60 dias" na ficha).
- [ ] **Carência**: cliente que caiu de nível mantém benefícios por **15 dias** (banner de carência na ficha).
- [ ] O **nível efetivo** de cada login de teste bate com os pontos válidos (Bronze/Prata/Ouro/Platina).

---

## 6. Acessos e bloqueios

- [ ] Cliente **inativo/inadimplente** loga mas fica travado na tela de bloqueio (sem cursos, sem benefícios, sem voucher) com botão de WhatsApp.
- [ ] Cliente comum **não** acessa as rotas de admin (`/dashboard`, `/clientes`).
- [ ] **Representantes** não aparecem na base do clube (foram removidos).
- [ ] Botão flutuante de **suporte (WhatsApp)** aparece em todas as telas do cliente.
- [ ] Menu lateral fixo no desktop e **hambúrguer** no mobile, para cliente e admin.

---

## 7. Interface / acabamento

- [ ] **Acentuação** correta nos menus e títulos (Início, Benefícios, Nível, Carência, Trajetória, etc.).
- [ ] Logo **CLUBE DEEP** no topo, sem texto extra embaixo.
- [ ] Responsivo no **celular e tablet** (menus, cards, tabelas).
- [ ] Nomes exibidos como "código - nome" e CPF/CNPJ **mascarado** na ficha do cliente.

---

## 8. Pendências do seu lado (fora do teste do app)

- [ ] Rodar a **carga de vendas** definitiva e zerar a base antiga (após validar o fluxo).
- [ ] Comercial coloca os **links das aulas**.
- [ ] Ligar o **webhook do CRM** (n8n).
- [ ] Setar a env `NEXT_PUBLIC_WHATSAPP_SUPORTE` no EasyPanel.
- [ ] Testar o **voucher em produção** (se emissão na loja 1 falhar, trocar `branchRegistrationCustomer`).
- [ ] Criar os **4 logins de teste** no Supabase Auth (seção 1).
