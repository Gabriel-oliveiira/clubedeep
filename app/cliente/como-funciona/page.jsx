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
        Cada R$ 1,00 faturado em compras vale 1 ponto. Para pontuar, o pedido precisa ser de no mínimo R$ 2.500,00,
        o equivalente a cerca de 12 peças. Pedidos abaixo desse valor não geram pontos. Consignados pontuam apenas
        quando a venda é fechada. Trocas puras não geram pontos, e devoluções são descontadas do seu saldo.
      </Bloco>

      <Bloco titulo="Pontos extras">
        Além dos pontos das compras, você ganha bônus automáticos. Pedidos a partir de R$ 5.300,00 rendem 400 pontos
        extras, e pedidos a partir de R$ 7.700,00 rendem 800 pontos extras. Comprando por 3 meses seguidos, você ganha
        1.000 pontos. Chegando a 6 meses seguidos, ganha mais 3.000 pontos.
      </Bloco>

      <Bloco titulo="Validade dos pontos">
        Cada ponto vale por 180 dias, contados a partir da data do faturamento. Sua categoria é recalculada em tempo
        real, sempre considerando apenas os pontos dentro da validade.
      </Bloco>

      <Bloco titulo="As categorias">
        Bronze: a partir de 2.500 pontos. Prata: acima de 30.000 pontos. Ouro: acima de 48.000 pontos.
        Platina: acima de 72.000 pontos. Como referência, manter o Prata pede uma média de R$ 5.000 por mês em compras,
        o Ouro pede R$ 8.000 e o Platina pede R$ 12.000. Você não precisa comprar todos os meses, esses valores são
        apenas um parâmetro.
      </Bloco>

      <Bloco titulo="Como funciona a DEEP Educa">
        A DEEP Educa é organizada em quatro trilhas, uma para cada categoria do clube. No Bronze você abre a Trilha
        Bronze, com 5 aulas. No Prata, a Trilha Prata. No Ouro, a Trilha Ouro. E no Platina, a Trilha Platina, com
        acesso completo às 11 aulas. O desbloqueio é acumulativo: ao subir de categoria, você mantém as trilhas que já
        tinha e ganha a nova. O vídeo de apresentação da coleção, publicado todo mês, fica disponível para todas as
        categorias.
      </Bloco>

      <Bloco titulo="Se você cair de categoria">
        Quando o saldo de pontos válidos fica abaixo do mínimo da sua categoria, você tem 15 dias de carência mantendo
        os benefícios antes de passar para a categoria anterior, e recebe um aviso por WhatsApp. O kit físico é entregue
        uma vez por categoria atingida, então uma queda seguida de reconquista não gera um novo kit.
      </Bloco>

      <Bloco titulo="Precisa de ajuda?">
        Fale com o CS da DEEP pelo WhatsApp. O botão de contato fica disponível em todas as telas do seu painel.
      </Bloco>
    </>
  );
}
