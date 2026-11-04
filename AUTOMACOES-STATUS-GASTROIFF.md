# GASTROIFF | Automações e grau real de funcionamento

Revisão de 04/11/2026. Este arquivo complementa o CADERNO-COMPLETO-GASTROIFF.md e o roteiro de acompanhamento. A presença de código não prova a execução de um serviço remoto.

## Oportunidades de emprego e estágio
Situação anterior: `assets/oportunidades.js` ocultava anúncios após 30 dias e o botão “Atualizar vagas” buscava o próprio `oportunidades.html`. Não descobria empregos novos. Alguns cartões públicos antigos tinham contato oficial, mas a continuidade da seleção não era conferida automaticamente.

Evolução na PR 7: `scripts/monitorar_oportunidades.py` consulta inicialmente duas fontes públicas de recrutamento, `https://bancodetalentos.grupojose.com.br/` e `https://grupobzbuzios.rhgestor.com.br/vagas`, extrai os títulos, municípios e datas que a fonte informa, filtra funções de Gastronomia e municípios da Região dos Lagos e registra identificadores para não repetir alertas. O agendamento em dias úteis (08h25 de Brasília no horário vigente) fica em `.github/workflows/monitorar-oportunidades.yml`. Em execução válida, atualiza `data/oportunidades-monitoradas.json` no GitHub e abre uma única tarefa de conferência quando surgirem anúncios ainda não vistos.

O portal busca o inventário gerado e exibe uma seção separada, com rótulo de anúncio localizado na fonte, não de vaga confirmada. A candidatura se faz na página oficial da empresa, cuja disponibilidade precisa ser conferida. As fontes iniciais são duas empresas da Região dos Lagos; elas não representam cobertura integral da região, de todos os estágios ou de todos os portais. O segundo portal fornece links individuais para as vagas, mas não informa necessariamente a data da publicação. A presença de HTML público não autoriza coleta de dados pessoais, candidaturas automáticas ou scraping agressivo.

Situação operacional verificada em 04/11/2026: a PR 7 foi integrada pelo commit `77dbed918` após aprovação do teste específico `41865175903` e da validação completa `41865175848`. Os logs do teste específico comprovam consulta externa real a ambas as fontes. O workflow em `main` executou, gerou commits automáticos de inventário e atualizou `data/oportunidades-monitoradas.json`; o arquivo publicado no repositório contém 7 anúncios após aplicar o limite de recência de 30 dias, além de IDs históricos para não anunciar novamente os mesmos registros. As tarefas de conferência foram abertas em `issues/8` (seis anúncios da fonte Grupo José) e `issues/11` (seis anúncios adicionais do Grupo BZ), com identificadores distintos. O inventário preserva origem, cargo, município, data da consulta e links; anúncios sem data explícita não recebem data inventada. A interface agora usa `data/oportunidades-monitoradas.json` na mesma origem do site, com botão de recarga e testes no navegador em celular, tablet e computador.

Limites: duas empresas não representam todos os estágios e empregos disponíveis; o monitor identifica anúncios, mas não verifica individualmente que inscrições ainda estão abertas. Um anúncio pode mudar ou encerrar sem aviso. A verificação da página final publicada e a primeira execução futura pelo gatilho de agenda devem ser observadas separadamente. Os arquivos gerados e as tarefas comprovam execuções automáticas reais por push no ramo principal, não apenas simulação.

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
