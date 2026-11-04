# GASTROIFF | Automações e grau real de funcionamento

Revisão de 04/11/2026. Este arquivo complementa o CADERNO-COMPLETO-GASTROIFF.md e o roteiro de acompanhamento. A presença de código não prova a execução de um serviço remoto.

## Oportunidades de emprego e estágio
Situação anterior: `assets/oportunidades.js` ocultava anúncios após 30 dias e o botão “Atualizar vagas” buscava o próprio `oportunidades.html`. Não descobria empregos novos. Alguns cartões públicos antigos tinham contato oficial, mas a continuidade da seleção não era conferida automaticamente.

Evolução na PR 7: `scripts/monitorar_oportunidades.py` consulta inicialmente duas fontes públicas de recrutamento, `https://bancodetalentos.grupojose.com.br/` e `https://grupobzbuzios.rhgestor.com.br/vagas`, extrai os títulos, municípios e datas que a fonte informa, filtra funções de Gastronomia e municípios da Região dos Lagos e registra identificadores para não repetir alertas. O agendamento em dias úteis (08h25 de Brasília no horário vigente) fica em `.github/workflows/monitorar-oportunidades.yml`. Em execução válida, atualiza `data/oportunidades-monitoradas.json` no GitHub e abre uma única tarefa de conferência quando surgirem anúncios ainda não vistos.

O portal busca o inventário gerado e exibe uma seção separada, com rótulo de anúncio localizado na fonte, não de vaga confirmada. A candidatura se faz na página oficial da empresa, cuja disponibilidade precisa ser conferida. As fontes iniciais são duas empresas da Região dos Lagos; elas não representam cobertura integral da região, de todos os estágios ou de todos os portais. O segundo portal fornece links individuais para as vagas, mas não informa necessariamente a data da publicação. A presença de HTML público não autoriza coleta de dados pessoais, candidaturas automáticas ou scraping agressivo.

Limitações a verificar após implantação: primeira execução efetiva com acesso à fonte no ambiente GitHub, publicação do inventário atualizado, consulta pela página ao arquivo no GitHub e existência de avisos de novas vagas sem repetição. Testes com HTML fictício e navegador não substituem uma execução agendada verdadeira. A busca continuará sujeita a alterações de layout e limites do portal de recrutamento.

## Calendário
`assets/events.js` apresenta eventos editoriais e calcula quais datas são futuras; o calendário pessoal gera arquivos ou links, mas a inclusão de novos eventos no banco editorial ainda é manual. Não há busca programada nem atualização automática de inscrições ou links de submissão. É necessário avaliar fontes verificáveis com feed/API antes de automatizar inclusão e retirada.

## Instagram
`assets/instagram.js` apenas lê `assets/instagram-feed.json`; sem autorização de perfil e sincronização por API não há atualização automática. Não usar coleta não autorizada.

## Planejamento docente, insumos e lembretes
O cadastro de ciclos é local. `apps-script/simular-avisos.gs` calcula avisos de sete dias em simulação, sem gatilho, remetentes ou destinatários reais. A leitura de arquivos Excel na Gestão é local. Não é possível enviar alertas verdadeiros de compras, informar disponibilidade institucional ou disponibilizar listas privativas ao(à) docente sem autenticação, fonte oficial, responsáveis e armazenamento protegido.

## Gestão, ocorrências e participação
Formulários preparam mensagens de e-mail; ainda não há caixa de entrada institucional conectada, identificação por protocolo, histórico de resposta e alertas automáticos da Gestão. O serviço Supabase está preparado no código, sem implantação.

## Indicadores e observatórios
`painel.html` oferece estrutura de apresentação e importações locais, sem fonte analítica conectada. Não divulgar métricas de acesso como se fossem reais.

## Critérios de aceite das próximas rotinas
Cada automação precisa de fonte legítima, atualização programada real, registro de última execução, identificação de novidade, prevenção de duplicatas, tratamento de fontes indisponíveis, ação segura e teste automatizado. Não publicar conteúdo de terceiros como verificado se a fonte não oferece confirmação específica. E-mails só serão ativados com consentimento/destinatários válidos. Registrar o commit, execução do GitHub Actions, teste de navegador e limitações. Evitar disparos repetidos de GitHub Actions em commits intermediários.
