# Clube DEEP - Painel

Painel de pontos do Clube DEEP (Next.js + Supabase), com 3 perfis:
- **admin** (TI): acesso total
- **suporte** (equipe DEEP): consulta clientes, saldo, extrato e trajetoria
- **loja** (cliente): ve apenas os proprios pontos (login por link magico no e-mail)

## 1. Variaveis de ambiente

Copie `.env.example` e preencha (no EasyPanel, cadastre como Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL` = https://belkndgffvclarrndrnm.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key (Supabase > Project Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (Supabase > Project Settings > API) — SECRETA
- `NEXT_PUBLIC_SITE_URL` = URL publica do painel (ex.: https://painel.grupodeep.com.br)

No EasyPanel, as `NEXT_PUBLIC_*` tambem precisam estar disponiveis no BUILD:
passe como Build Args com os mesmos nomes/valores (o Dockerfile ja aceita).

## 2. Configuracao no Supabase (uma vez)

Em **Authentication > URL Configuration**:
- Site URL: a mesma do `NEXT_PUBLIC_SITE_URL`
- Redirect URLs: adicione `https://SEU_DOMINIO/auth/callback`

Em **Authentication > Providers > Email**: deixe o Email habilitado.
Para producao, configure um SMTP proprio (Auth > Emails/SMTP) — o SMTP padrao do Supabase tem limite baixo.

## 3. Deploy no EasyPanel

1. Crie um app do tipo **App / Dockerfile** apontando pra este repositorio (ou faca upload do zip).
2. Em **Environment**, cadastre as 4 variaveis acima.
3. Em **Build**, informe os Build Args: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
4. Porta interna: **3000**.
5. Aponte o dominio e ative o SSL.

## 4. Criar usuarios internos (admin/suporte)

1. No Supabase > **Authentication > Users > Add user**: crie o usuario com e-mail e senha.
2. No banco, cadastre o papel:

```sql
insert into public.painel_acessos (email, papel) values
  ('ti@grupodeep.com.br', 'admin'),
  ('suporte@grupodeep.com.br', 'suporte')
on conflict (email) do update set papel = excluded.papel;
```

## 5. Lojas (clientes)

Ja estao pre-cadastradas em `painel_acessos` (papel 'loja') para todos os clientes
que tem e-mail na base. A loja entra na aba **Loja** do login, recebe um link no e-mail
e ve so os proprios pontos. Novos clientes com e-mail entram rodando de novo:

```sql
insert into public.painel_acessos (email, papel, cd_cliente)
select lower(trim(email)), 'loja', cd_cliente
from public.clube_clientes
where email is not null and trim(email) <> ''
on conflict (email) do nothing;
```

## Rodar local (opcional)

```bash
cp .env.example .env.local   # preencha as chaves
npm install
npm run dev                  # http://localhost:3000
```
