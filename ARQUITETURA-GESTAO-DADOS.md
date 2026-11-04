# Estrutura prevista para Gestão e Observatório GASTROIFF
Atualização em 04/11/2026. Especificação de implantação. Nenhum banco ou API está ativo.

## Divisão de responsabilidades
- Portal público em GitHub Pages. Conteúdos publicados não incluem respostas identificáveis.
- Administração do projeto: responsável permanente, com notificações de atividade editorial, pendências e integridade.
- Responsáveis institucionais: encaminhamento de demandas de laboratório e curso aos setores e coordenações que ocupem as funções, independentemente de quem seja o coordenador no futuro.
- Administração autenticada em serviço privado a escolher com governança institucional, regras de acesso por perfil e backups.
- Avisos à administração não devem incluir respostas pessoais ou informações acadêmicas individuais no corpo do e-mail.

## Tipos de registros
1. Usuários e permissões: perfil, vínculo, contato validado, permissões, responsável institucional e alterações.
2. Solicitações e ocorrências: identificador único, data, curso, categoria, local, descrição, impacto, fonte, anexos privados, responsável de destino, situação, prazo, datas de movimentação e histórico.
3. Encaminhamentos: número da ocorrência, área destinatária, responsável, data, decisão, justificativa, medida efetuada e documento comprobatório quando aplicável.
4. Conteúdo editorial: tipo (vaga/evento/pesquisa/perfil/projeto/documento), fonte, autor, data de recebimento, prazo, anexos, dados validados, versão, situação de revisão, confirmação de publicação, endereço final e histórico reversível.
5. Pesquisas: instrumento, versão, perguntas condicionais, coorte, público, termo de informação, período de aplicação e status.
6. Respostas de pesquisa: identificador de pesquisa, período, resposta anonimizada/pseudonimizada conforme o caso, versão das perguntas, acesso protegido, política de retenção e autorização para uso.
7. Egressos: vínculos voluntários, curso, ano de conclusão, contatos armazenados separadamente das respostas analíticas, consentimento e ciclos de acompanhamento.
8. Agregados: contagens e percentuais com denominadores, períodos, critérios para divulgação e limites mínimos contra reidentificação.
9. Recomendações institucionais: origem dos dados, diagnóstico, proposta, setor destinatário, data de encaminhamento, deliberação, retorno, status e nova avaliação.
10. Notificações: destinatário, categoria, prioridade, título sem dados pessoais, horário, frequência, envio, resultado e tentativas.

## Fluxo do Livro de Ocorrências
Receber registro e eventual foto -> validar campos e extensão do arquivo -> gerar número de acompanhamento -> confirmar envio -> classificar pelo tipo e urgência -> informar setor competente -> acompanhar providência -> registrar solução -> convidar o solicitante a avaliar o encaminhamento, se pertinente -> agregar os dados em relatório institucional.
O usuário poderá optar por identificação ou envio sem nome quando isso for compatível com o fluxo. A equipe será clara sobre os limites do anonimato em situações que exijam resposta.

## Fluxo da publicação assistida
Receber imagem, texto, planilha, PDF ou calendário -> identificar tema -> estruturar informações com IA em serviço privado -> conferir URLs e campos obrigatórios -> mostrar prévia comparativa -> aguardar aprovação do administrador -> atualizar a fonte única de dados -> publicar no portal, inclusive feeds/ICS -> registrar alterações e permitir reversão.
A IA nunca terá autorização irrestrita de publicação. Fotografias e dados pessoais não serão enviados ao serviço de IA sem avaliação de necessidade e conformidade.

## Fluxo das pesquisas
Editor de questionários acessível -> validação metodológica -> coleta protegida -> atualização automática de estatísticas agregadas -> revisão do relatório -> publicação pública apenas de resultados com denominador, período e limitações -> recomendações institucionais -> acompanhamento das ações.
Pesquisas sobre ingresso, permanência, currículo e formação devem permanecer distintas da análise de navegação. O tratamento de dados acadêmicos oficiais dependerá de autorização institucional.

## Acompanhamento de egressos
Cadastro voluntário e atualização de contato separada das respostas. Instrumentos na conclusão, após 6 meses, 12 meses, 3 e 5 anos; possibilidade de registrar múltiplos campos de atuação, empreendedorismo, pesquisa, inovação, políticas públicas, atuação territorial e continuidade da formação.
Medir não apenas distribuição de ocupações, mas cobertura das turmas e não resposta. Evitar confundir percepção de contribuição do curso com efeito causal.

## Decisões pendentes antes da implantação efetiva
- Aprovação da infraestrutura de autenticação, banco e armazenamento de anexos.
- Regras de governança e custódia dos dados junto ao IFF e responsável de proteção de dados.
- Definição de provedores e credenciais mantidas somente no servidor.
- Política de consentimento, retenção e exclusão de dados e processo de atendimento a titulares.
- Configuração segura de notificações e identificações de destinatários.
- Testes em celular, computador e PWA, inclusive acessibilidade.
