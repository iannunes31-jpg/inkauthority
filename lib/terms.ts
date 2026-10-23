// Bump the version whenever the text changes: every student must accept the new one again.
export const TERMS_VERSION = "2026-10-23";
export const TERMS_UPDATED_AT = "23 de outubro de 2026";

// Fill these in before publishing (ask a lawyer to review the whole text).
const COMPANY = "Ink Authority";
const COMPANY_ID = "[CNPJ da empresa]";
const CONTACT = "inkauthorityapp@gmail.com";
const FORUM = "[cidade/UF]";

export const TERMS_SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Aceite",
    body: [
      `Estes Termos de Uso regulam o acesso à plataforma ${COMPANY} (${COMPANY_ID}), incluindo as Stream Classes, aulas ao vivo, materiais, ferramentas de IA e comunidade.`,
      "Ao marcar a opção de aceite e clicar em \"Aceitar e continuar\", você declara que leu, entendeu e concorda com todas as condições abaixo. Se não concordar, não utilize o conteúdo.",
    ],
  },
  {
    title: "2. Licença de uso pessoal",
    body: [
      "Ao adquirir uma Stream Class você recebe uma licença pessoal, individual, intransferível e não exclusiva para assistir ao conteúdo dentro da plataforma, pelo prazo de acesso contratado.",
      "A licença não transfere a propriedade de nenhum conteúdo. Todas as aulas, vídeos, textos, imagens, marcas e materiais são protegidos pela Lei de Direitos Autorais (Lei 9.610/98) e pertencem à " + COMPANY + " ou aos seus autores.",
    ],
  },
  {
    title: "3. O que é proibido",
    body: [
      "É expressamente proibido, por qualquer meio ou dispositivo: (a) gravar a tela, filmar ou capturar o áudio das aulas; (b) tirar prints ou fotos do conteúdo; (c) baixar, copiar, reproduzir, editar ou distribuir os vídeos e materiais; (d) compartilhar, emprestar, vender ou ceder seu login e senha; (e) exibir as aulas para terceiros ou em grupo; (f) publicar qualquer trecho do conteúdo em redes sociais, grupos, sites, cursos ou plataformas de terceiros.",
      "Também é proibido tentar burlar as proteções da plataforma, como a marca d'água, o player de vídeo ou os controles de acesso.",
    ],
  },
  {
    title: "4. Marca d'água e monitoramento",
    body: [
      "Para proteger o conteúdo, todas as aulas exibem uma marca d'água com dados de identificação do aluno (como o e-mail da conta). Essa marca permite identificar a origem de qualquer cópia não autorizada.",
      "A plataforma registra dados de acesso (data, horário, endereço IP e dispositivo) para segurança e para apurar violações destes Termos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/18).",
    ],
  },
  {
    title: "5. Consequências do descumprimento",
    body: [
      "Constatada a violação de qualquer item da seção 3, a " + COMPANY + " poderá, a seu critério: suspender imediatamente o acesso; encerrar a conta de forma definitiva, com a perda do direito de acesso às Stream Classes e demais conteúdos adquiridos; e adotar as medidas judiciais cabíveis, inclusive pedido de indenização pelos danos causados.",
      "O encerramento da conta por violação destes Termos não gera direito a reembolso, ressalvados os direitos garantidos por lei ao consumidor.",
    ],
  },
  {
    title: "6. Conta e acesso",
    body: [
      "A conta é pessoal. Você é responsável por manter sua senha em sigilo e por toda atividade realizada com o seu login. Acessos simultâneos ou em padrões incompatíveis com uso individual podem ser bloqueados.",
    ],
  },
  {
    title: "7. Direito de arrependimento",
    body: [
      "Compras feitas pela internet podem ser canceladas em até 7 (sete) dias a partir da compra, conforme o art. 49 do Código de Defesa do Consumidor. O pedido deve ser feito pelo e-mail " + CONTACT + ".",
    ],
  },
  {
    title: "8. Alterações",
    body: [
      "Estes Termos podem ser atualizados. Quando isso acontecer, você será avisado e precisará aceitar a nova versão para continuar acessando o conteúdo.",
    ],
  },
  {
    title: "9. Contato e foro",
    body: [
      `Dúvidas: ${CONTACT}. Fica eleito o foro da comarca de ${FORUM}, ressalvado o direito do consumidor de propor ação no foro do seu domicílio.`,
    ],
  },
];
