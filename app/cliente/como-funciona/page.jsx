import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';

export const dynamic = 'force-dynamic';

export default async function ComoFunciona() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const Bloco = ({ titulo, children }) => (
    <div className="card">
      <h2 style={{ textTransform: 'none', fontSize: 15, color: 'var(--ink)', letterSpacing: 0 }}>{titulo}</h2>
      <div className="muted" style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </div>
  );

  return (
    <>
      <div className="page-head"><div><h1>Como funciona</h1><div className="sub">As regras do Clube Deep, de forma simples.</div></div></div>

      <Bloco titulo="Como você acumula pontos">
        Cada R$ 1,00 faturado em compras vale 1 ponto. Para pontuar, o pedido precisa ser de no minimo R$ 2.500,00,
        o equivalente a cerca de 12 pecas. Pedidos abaixo desse valor nao geram pontos. Consignados pontuam apenas
        quando a venda e fechada. Trocas puras nao geram pontos, e devolucoes sao descontadas do seu saldo.
      </Bloco>

      <Bloco titulo="Pontos extras">
        Alem dos pontos das compras, voce ganha bonus automaticos. Pedidos a partir de R$ 5.300,00 rendem 400 pontos
        extras, e pedidos a partir de R$ 7.700,00 rendem 800 pontos extras. Comprando por 3 meses seguidos, voce ganha
        1.000 pontos. Chegando a 6 meses seguidos, ganha mais 3.000 pontos.
      </Bloco>

      <Bloco titulo="Validade dos pontos">
        Cada ponto vale por 180 dias, contados a partir da data do faturamento. Sua categoria e recalculada em tempo
        real, sempre considerando apenas os pontos dentro da validade.
      </Bloco>

      <Bloco titulo="As categorias">
        Bronze: a partir de 2.500 pontos. Prata: acima de 30.000 pontos. Ouro: acima de 48.000 pontos.
        Platina: acima de 72.000 pontos. Como referencia, manter o Prata pede uma media de R$ 5.000 por mes em compras,
        o Ouro pede R$ 8.000 e o Platina pede R$ 12.000. Voce nao precisa comprar todos os meses, esses valores sao
        apenas um parametro.
      </Bloco>

      <Bloco titulo="Como funciona o DEEP Educa">
        O DEEP Educa e organizado em quatro trilhas, uma para cada categoria do clube. No Bronze voce abre a Trilha
        Bronze, com 5 aulas. No Prata, a Trilha Prata. No Ouro, a Trilha Ouro. E no Platina, a Trilha Platina, com
        acesso completo as 11 aulas. O desbloqueio e acumulativo: ao subir de categoria, voce mantem as trilhas que ja
        tinha e ganha a nova. O video de apresentacao da colecao, publicado todo mes, fica disponivel para todas as
        categorias.
      </Bloco>

      <Bloco titulo="Se você cair de categoria">
        Quando o saldo de pontos validos fica abaixo do minimo da sua categoria, voce tem 15 dias de carencia mantendo
        os beneficios antes de passar para a categoria anterior, e recebe um aviso por WhatsApp. O kit fisico e entregue
        uma vez por categoria atingida, entao uma queda seguida de reconquista nao gera um novo kit.
      </Bloco>

      <Bloco titulo="Precisa de ajuda?">
        Fale com o CS da DEEP pelo WhatsApp. O botao de contato fica disponivel em todas as telas do seu painel.
      </Bloco>
    </>
  );
}
