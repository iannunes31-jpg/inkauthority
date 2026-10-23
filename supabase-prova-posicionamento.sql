-- Prova final do curso "Posicionamento e Marketing digital" (10 questões, aprovação com 70%).
-- Rodar no Supabase -> SQL Editor. Pode rodar de novo: substitui as questões.
-- No fim aparece uma tabela confirmando: título da prova, se está liberada e quantas questões tem.

INSERT INTO public.course_exams (course_id, title, description, passing_score, max_attempts, active, updated_at)
VALUES ('87dd4acc-de42-4275-921e-8843719b023c', 'Prova Final de Certificação',
        'Responda as 10 questões. Com 7 ou mais acertos (70%) você é aprovado e recebe o certificado de conclusão.',
        70, NULL, true, now())
ON CONFLICT (course_id) DO UPDATE
  SET title = EXCLUDED.title, description = EXCLUDED.description,
      passing_score = EXCLUDED.passing_score, active = true, updated_at = now();

DELETE FROM public.exam_questions
WHERE exam_id = (SELECT id FROM public.course_exams WHERE course_id = '87dd4acc-de42-4275-921e-8843719b023c');

INSERT INTO public.exam_questions (exam_id, position, question, options, correct_index, explanation)
SELECT e.id, q.position, q.question, q.options, q.correct_index, q.explanation
FROM public.course_exams e
CROSS JOIN (VALUES
  (1, 'O que é uma "persona" no marketing para tatuadores?',
   jsonb_build_array('Um personagem de ficção usado em campanhas publicitárias', 'Uma representação fictícia e detalhada do cliente ideal, baseada em dados reais', 'O nome artístico que o tatuador usa nas redes sociais', 'Uma conta falsa criada para aumentar seguidores'),
   1, 'A persona é o retrato do seu cliente ideal (idade, rotina, dores, desejos), construído a partir de clientes reais. Ela guia todo o seu conteúdo.'),
  (2, 'Por que definir um público-alvo específico é importante para um tatuador nas redes sociais?',
   jsonb_build_array('Para impedir que pessoas de fora da cidade sigam o perfil', 'Porque o Instagram exige que cada conta tenha um nicho definido', 'Para criar conteúdo que conversa com quem realmente vai contratar, atraindo os clientes certos', 'Para aumentar o preço das tatuagens sem justificativa'),
   2, 'Quem tenta falar com todo mundo não conecta com ninguém. Conteúdo específico atrai o cliente que você quer atender.'),
  (3, 'Qual das alternativas é um exemplo de objeção comum antes de tatuar?',
   jsonb_build_array('"Quero marcar para amanhã"', '"Adorei seu trabalho, pode me atender hoje?"', '"Tá caro, preciso pensar mais"', '"Qual o tamanho máximo que você faz?"'),
   2, 'Objeção é o motivo que trava a decisão de compra: preço, medo, dúvida sobre o desenho, indecisão.'),
  (4, 'Qual formato tem maior potencial de alcance orgânico para atingir pessoas novas no Instagram?',
   jsonb_build_array('Stories com figurinhas', 'Reels (vídeos curtos)', 'Fotos estáticas no feed', 'Link na bio'),
   1, 'Os Reels são distribuídos para quem ainda não te segue. Stories falam com quem já te segue.'),
  (5, 'Pela regra de ouro do conteúdo, para cada post de venda, quantos posts de valor você deve publicar?',
   jsonb_build_array('1 post de valor para cada post de venda', '2 posts de valor para cada post de venda', 'Pelo menos 4 posts de valor para cada post de venda', 'Não há limite: quanto mais vender, melhor'),
   2, 'Vender o tempo todo afasta. Entregar valor (educativo, bastidores, transformação, entretenimento) constrói a confiança que vende.'),
  (6, 'Qual formato é mais indicado para conteúdo educativo, como "5 cuidados pós-tatuagem"?',
   jsonb_build_array('Story com contagem regressiva', 'Carrossel (sequência de imagens)', 'Live de 2 horas', 'Foto única com emoji na legenda'),
   1, 'O carrossel organiza a informação em passos e é muito salvo, o que aumenta a sua autoridade.'),
  (7, 'Qual é o enquadramento ideal para filmar o depoimento de um cliente?',
   jsonb_build_array('Da cintura para cima, com a câmera abaixo do queixo apontando para cima', 'Dos ombros para cima (close médio), com a câmera na altura dos olhos', 'Corpo inteiro, com a câmera no chão', 'Rosto cortado ao meio para dar efeito dramático'),
   1, 'Close médio na altura dos olhos passa naturalidade e confiança, sem distorcer o rosto.'),
  (8, 'O que deve aparecer nos primeiros 3 segundos de um vídeo de depoimento para prender a atenção?',
   jsonb_build_array('O logotipo do estúdio em animação', 'O cliente falando o nome completo e a profissão', 'A tatuagem em close, mostrando o resultado', 'Uma música de fundo popular'),
   2, 'O resultado é o gancho: mostre a tatuagem primeiro e deixe a história vir depois.'),
  (9, 'Quando o cliente diz "Tá caro", qual é a melhor resposta segundo os scripts de venda?',
   jsonb_build_array('"Tudo bem, fica para outra vez então"', '"Posso fazer um desconto, me faz uma proposta"', 'Mostrar o valor do serviço (higiene, materiais premium, garantia) e perguntar se pode explicar cada etapa', 'Ignorar a mensagem e esperar o cliente voltar'),
   2, 'Em vez de baixar o preço, mostre o que está incluído nele. Quem entende o valor para de comparar só o preço.'),
  (10, 'De acordo com a Ink Authority, a venda é consequência de:',
   jsonb_build_array('Ter o menor preço do mercado', 'Postar todo dia sem exceção', 'Confiança, construída com valor, presença e relacionamento', 'Comprar seguidores para parecer popular'),
   2, 'Venda é consequência de confiança. Conteúdo de valor e atendimento atencioso constroem essa confiança.')
) AS q(position, question, options, correct_index, explanation)
WHERE e.course_id = '87dd4acc-de42-4275-921e-8843719b023c';

SELECT e.title AS prova, e.active AS liberada, count(q.id) AS questoes
FROM public.course_exams e
LEFT JOIN public.exam_questions q ON q.exam_id = e.id
WHERE e.course_id = '87dd4acc-de42-4275-921e-8843719b023c'
GROUP BY e.title, e.active;
