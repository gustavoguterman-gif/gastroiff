# Pesquisas de egressos do GASTROIFF | Projeto dos instrumentos e indicadores
Versão de preparação, 06/11/2026. Nenhum questionário está aberto ou recolhendo respostas.

## Dois questionários e uma divulgação pública
O questionário Técnico em Gastronomia será dirigido exclusivamente a egressos do curso técnico. O questionário Superior de Tecnologia em Gastronomia será dirigido exclusivamente a egressos da graduação. O perfil público Egresso apresenta os caminhos para os instrumentos, mas não prova vínculo institucional nem libera o preenchimento.

As páginas do Observatório e de resultados consolidados serão visíveis a Visitante, Estudante, Docente e Egresso. O preenchimento somente poderá ocorrer após convite validado, formulário protegido, texto informativo sobre a pesquisa e aceite explícito. A seleção do perfil na abertura não substitui essa verificação.

## Instrumento do Técnico: proposta para aprovação
Questões fechadas e opcionais por bloco: ano de conclusão (faixas quando necessário); continuidade dos estudos; situação de trabalho; atuação ou não no setor de alimentação; tempo até a primeira oportunidade relacionada à formação; tipo principal de vínculo, usando categorias amplas; relação entre competências aprendidas e atividades realizadas; acesso a oportunidades e necessidade de formação complementar; avaliação de aspectos do curso. Pergunta discursiva opcional para sugestões, exclusivamente para análise interna e nunca incluída diretamente em dados públicos.

## Instrumento da graduação: proposta para aprovação
Questões fechadas: período de conclusão por faixa; situação profissional; atuação na Gastronomia; ensino, pesquisa e extensão no percurso; continuidade da formação; ocupação por categorias amplas; vínculo e inserção no trabalho; relação entre a formação e o trabalho; avaliação do curso e necessidades de aprimoramento. Sugestão discursiva opcional para análise protegida. Não solicitar nome, matrícula ou SIAPE no instrumento de respostas.

## Regras para formulários e dados
O banco deve receber respostas somente de backend autorizado. Convites precisam ser de uso único, expirar, poder ser revogados e ser armazenados como hash. Uma identidade elegível não pode responder em nome de outro curso. O navegador nunca recebe chave privilegiada ou acesso bruto às respostas.

A equipe deve definir finalidade, base legal, informação aos participantes, prazo de guarda, retirada ou correção possíveis, tratamento de texto livre, regras éticas institucionais e autorização para divulgação ANTES da coleta. O cadastro dos contatos de egressos precisa de origem e permissão próprias, separados do questionário.

## Indicadores de pesquisa
Cada indicador precisa apresentar curso, período, tamanho da amostra, população de referência quando houver, metodologia, última verificação e grau de cobertura. Indicadores iniciais: taxa de participação por curso e período (somente com denominador confiável); percentual em atividade profissional; percentual atuando na área; continuidade de estudos; avaliação da formação; acesso a oportunidades. A participação no site e os cliques em vagas não comprovam contratação.

A visualização automática depende de um serviço que gere agregados a partir de respostas validadas. Publicar no Observatório apenas grupos suficientemente grandes e revistos, nunca tabelas com nomes, textos livres, tokens ou registros individuais. O limiar inicial no banco é cinco respostas, que não elimina por si só o risco de identificação indireta. Restringir combinações de filtros para prevenir inferências por diferença entre totais.

## Passos de homologação
1. Revisar e aprovar as perguntas com coordenação e equipe de pesquisa, com atenção aos dois cursos.
2. Executar a migração em ambiente de teste isolado, nunca diretamente na base de produção.
3. Criar convites e respostas fictícias; testar ausência de leitura e escrita com anon e authenticated.
4. Verificar elegibilidade real, uso único, expiração e revogação no backend.
5. Testar composição de indicadores agregados, corte de grupos pequenos, ausência de textos livres e atualização após publicação.
6. Verificar celular de 390 px, tablet de 768 px e computador de 1440 px, inclusive navegação por teclado e movimento reduzido.
7. Somente depois de autorização institucional e dos testes, habilitar formulários e divulgação real.

## Estado real de implementação
Preparado: esquema SQL fechado por padrão, desenho dos instrumentos, plano de indicadores e caminhos de navegação. Não implementado: integração do banco, formulário autenticado, envio de respostas, coleta em tempo real, consentimento, publicação automatizada e relatórios alimentados por dados reais.
