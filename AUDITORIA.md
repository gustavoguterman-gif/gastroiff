# Auditoria de implantação do GASTROIFF

Atualização: 1 de novembro de 2026.

## Aplicado no repositório
- Cabeçalho comum nas páginas inicial, cursos, laboratórios, documentos, docentes, calendário, biblioteca, perfil e livro.
- Menu compacto à esquerda abaixo de 1241 px, com abertura, fechamento, tecla Escape e atributos acessíveis.
- Tratamento de fundo branco conectado às bordas das duas logomarcas originais por canvas, preservando os desenhos. As imagens originais JPG permanecem como alternativa se o navegador não permitir o processamento.
- Correções de texto residual na biblioteca e link para documentos na página de cursos.
- Atualização do service worker e do cache de recursos estáticos.
- Composição discente não confirmada sinalizada sem nomes fictícios.

## Auditoria de dados, ainda não aprovada
- Acervo: 72 registros; 1 sem capa; 19 sem autor. Há resumos genéricos que exigem revisão bibliográfica e conferência de exemplares no catálogo institucional.
- Docentes: 12 perfis no conjunto atual; 12 sem URL de fotografia; 2 sem Lattes; 9 sem link da titulação. Não substituir fotos por identidades presumidas.
- Eventos: conferir datas, endereços, fontes oficiais e funcionamento dos links.
- Documentos e cursos: conferir PPC, carga horária, matriz, calendário vigente e URLs institucionais.
- Laboratórios: testar ampliação da planta, manual, links e funcionamento em celular.
- Aplicativo: testar instalação real no Android, iOS e computador, atualização do cache e acesso sem conexão.
- Identidade visual: testar o tratamento de transparência nas marcas, inclusive em celulares e computadores, antes de considerá-lo definitivo.

## Critérios para concluir
1. Abrir todas as páginas em tela estreita, intermediária e larga.
2. Verificar abertura/fechamento de menu, ausência de corte, navegação e estados de foco.
3. Testar pesquisa por título e assunto no acervo e comprovar cada quantidade de exemplares em fonte oficial.
4. Revisar os 12 perfis docentes individualmente, respeitando informações comprovadas e direitos das fotografias.
5. Validar os links externos, calendário e documentos.
6. Testar instalação, navegação e atualização do aplicativo.
7. Só então registrar a revisão final como concluída.

Este documento distingue alterações feitas no código de verificações que ainda não foram executadas.
## Revisão adicional em 01/11/2026
- Busca de livros agora inclui texto da sinopse; a contagem de exemplares aparece explicitamente como levantamento de 2025, sem insinuar disponibilidade para empréstimo.
- A apresentação bibliográfica continua parcialmente incompleta: 19 registros sem autor, uma capa ausente e sinopses genéricas. Não preencher campos por aproximação.
- Conferência da versão pública por ferramenta de navegação não foi concluída: a tentativa de leitura externa falhou. Permanece obrigatório testar em navegador real.
- Divergência nominal a validar antes da atualização: a página de docentes exibe “Adriana Slongo” e o conjunto estruturado de perfis usa “Adriana Marcussi” com nome completo “Adriana Paula Slongo Marcussi”. Não alterar a identificação sem confirmar o nome de apresentação preferido.

## Revisão de continuidade
- Correção publicada no código: busca do acervo passa a incluir a sinopse, e a quantidade aparece como número do levantamento, não disponibilidade imediata.
- Página livro.html antes sem renderização da obra: criado assets/livro.js, utilizando exclusivamente os campos do acervo existente, com mensagem para ID inexistente e retorno à biblioteca.
- Links de navegação da página individual de livro corrigidos.
- Service worker atualizado para incluir a nova ficha individual (cache v10).
- A versão renderizada ainda requer teste manual de navegador e a auditoria de conteúdo ainda não está aprovada.

## Padronização geográfica de 01/11/2026
- Identificação visual do campus padronizada como “campus Cabo Frio - RJ” nas nove páginas principais, inclusive no trecho indicado pelo usuário.
- Conferência automática de nove páginas: todas têm identificação completa, menu e script de transparência; nenhuma apresenta “campus Cabo Frio” sem “- RJ”.
- Texto institucional, eventos, identificação alternativa do rodapé e manifesto do aplicativo também revisados.
- Mantidos títulos de obras e nomes próprios que contêm “Cabo Frio”, para não adulterar referências.
- Validação em navegadores reais continua pendente; a inspeção externa do site não retornou acesso.

## Rodada de revisão de navegação e fontes
- Conferidos os links HTML locais nas nove páginas do núcleo: nenhum destino .html inexistente foi encontrado na varredura estática. A varredura não comprova resposta de servidores externos ou funcionamento JavaScript.
- Nome de apresentação “Adriana Slongo” harmonizado no arquivo estruturado de docentes e na listagem; nome completo preservado. Os dados acadêmicos continuam exigindo conferência na fonte.
- Texto da Biblioteca atualizado para distinguir sinopses editoriais e levantamento histórico de exemplares; descrição da página corrigida.
- Nota da página de perfis docentes corrigida, sem atribuir todo o acervo de informações aos PPCs de 2022 e 2023.
- Cache do aplicativo incrementado para v13.
- Tentativa de abrir o domínio publicado por ferramenta externa falhou: testes visuais e funcionais reais permanecem pendentes.

## Revisão da nomenclatura da comunidade acadêmica
- Navegação principal e móvel alterada de “Docentes” para “Comunidade” nas nove páginas verificadas.
- Página de destino intitulada “Comunidade acadêmica”, com subdivisões para corpo docente, Colegiado, representação técnico-administrativa, discente e NDE.
- Substituídos nomes provisórios de representação discente por “Representação discente em confirmação”.
- Preservado o endereço docentes.html para compatibilidade com links existentes.
- Validação estática das nove páginas concluída. Testes reais de dispositivo e fontes acadêmicas permanecem pendentes.

## Contato e representação técnico-administrativa, 01/11/2026
- Incluídos Daiana Costa Pereira e Lygia Gottgtroy Fraga Zigolis Filha de Oliveira no mesmo conjunto de dados e cartões de perfis da comunidade, com acesso a perfil individual.
- Formação e atuação da Daiana baseadas no Banco de Fontes do IFF; Lattes específico ainda não localizado com segurança, portanto nenhum link foi atribuído por suposição.
- Formação e experiência da Lygia apoiadas no portal Rede Integra, com Lattes 7266848136316618 identificado.
- Criada a página contato.html com Gustavo da Cunha Guterman, e-mail da coordenação do Tecnólogo, e-mail do Técnico e telefone geral da recepção (22) 2645-9500.
- E-mail clicável do Tecnólogo inserido na faixa abaixo do cabeçalho em todas as nove páginas previamente existentes.
- Não confundir contato geral do campus com ramal direto da coordenação. Verificar funcionamento dos endereços de e-mail internamente antes de aprovação externa.
- Preservada a identidade visual e as regras responsivas existentes, acrescentando apenas estilo discreto para o contato.

## Conferência incremental da área docente (04/11/2026)
- Página `planejamento-docente.html` criada com cadastro de ciclos local, lista de docentes do próprio site, curso, disciplina, local, início/fim e quadro de providências prévias às práticas.
- Interface não apresenta previsão de compras ou recebimentos como fato; sem integração com Drive, SIAPE, matrícula ou serviços de e-mail.
- Código de teste preparado em `tests/planejamento-docente-navegador.cjs` e execução automatizada em `.github/workflows/testar-planejamento-docente.yml`.
- Verificação estática de caminhos e sintaxe realizada pelo workflow `integridade-site.yml`, aprovado na versão inicial. A validação de navegador da página nova será registrada separadamente após o resultado.
- O teste usa informações fictícias em ambiente temporário, incluindo cenário de término anterior ao início, repetição de ciclo, persistência no navegador e exportação, além de adaptação em diferentes larguras.
- A fonte institucional de ciclos e o status das aquisições ainda não foram conectados, logo não há aviso automático nem confirmação de insumos nesta entrega.

## Resultado confirmado da rodada de testes do planejamento docente
- Execução GitHub Actions 41847452493 concluída com sucesso em 04/11/2026. Navegador Chromium testado em celular 390 px, tablet 768 px e desktop 1440 px.
- Passaram verificações de carregamento, lista docente, rejeição de datas invertidas, criação de ciclo fictício, permanência após recarga, rejeição de duplicatas, exportação CSV com datas, remoção e ausência de transbordamento horizontal ou erros JavaScript nos fluxos testados.
- A versão ainda é um planejador local sem calendário institucional conectado, envio automático, banco compartilhado ou situação real de compras. A implantação integrada permanece pendente.

## Rodada: planilha de teste no Drive, importação CSV e avisos simulados (04/11/2026)
- Criada e conferida uma planilha **nativa do Google Planilhas**, intitulada `GASTROIFF | TESTE | Ciclos e Insumos`, com as abas `Ciclos`, `Insumos` e `Instrucoes`. Apenas dados fictícios, sem estudantes, compras institucionais reais ou listas de destinatários. O identificador não foi exposto nos arquivos públicos do portal.
- Na Área Docente `planejamento-docente.html`, implantada a importação **local e revisável** de CSV da aba Ciclos: leitura de cabeçalhos, validação de nomes docentes do próprio cadastro, curso, datas e duplicidades; linhas de teste e registros incompatíveis são recusados; a inclusão exige confirmação. Arquivos: `assets/ciclos-csv.js` e `assets/planejamento-docente.js`.
- A importação não lê o Drive automaticamente, não publica dados para outras pessoas e não altera a planilha original. A aba Insumos permanece como estrutura preparada, **ainda sem sincronização ou consulta de situação de compra no site**.
- Preparado `apps-script/simular-avisos.gs`, com leitura planejada de Ciclos/Insumos por propriedade privada, cálculo de aviso exatamente sete dias antes e registro de simulação no log. O script **não está implantado, não tem gatilho agendado e não envia e-mails**.
- Criados testes em `tests/ciclos-csv.test.cjs` e `tests/apps-script-simulacao.test.cjs`, adicionados à execução automatizada; verificação funcional do fluxo CSV estendida em `tests/planejamento-docente-navegador.cjs`.
- Os testes encontraram e corrigiram um erro no reconhecimento da extensão `.csv`. Após a correção, a execução GitHub Actions `41850224517` concluiu **9 testes unitários aprovados, 0 falhas**, e testes de navegador aprovados em celular, tablet e computador, incluindo recusa de dados fictícios, inclusão de CSV válido, persistência, prevenção de duplicatas, exportação e exclusão.
- Antes de usar dados institucionais, ainda faltam: definir a responsabilidade por alimentar a situação das compras e sua data/fonte, realizar teste de leitura e atualização de Insumos, validar permissões, implantar um Apps Script autorizado, impedir mensagens repetidas e testar e-mails somente com destinatário de prova.

## Revisão técnica de 06/11/2026, fase 0 de 11

- Corrigida em `tests/integridade-site.test.mjs` a exigência obsoleta de versões fixas do CSS e JavaScript de animações. O teste agora compara as versões efetivamente declaradas por página e acusa divergência entre elas.
- Conferência diretamente no código de `cursos.html`, `revistas.html`, `oportunidades.html`, `observatorio.html`, `docentes.html` e `eventos.html`: CSS e JavaScript compartilham a versão `20261106-motion2` nesses seis arquivos.
- Os testes estáticos de contato têm rotina própria em `.github/workflows/verificar-contato.yml` para push relevante, pull request e execução manual.
- **Não homologado:** execução da suíte de integridade após esta correção; testes visuais no navegador publicado em celular, tablet e computador; fluxo real de navegação, PWA e acessibilidade interativa. A fase 0 de 11 continua aberta.


## Evidência de execução dos testes na revisão docente nº 26 (06/11/2026)

- GitHub Actions `42023429473`, em 05/11/2026: job `verificacao` concluído com `success`. Logs conferidos: teste de perfis em celular, tablet e desktop; auditoria de navegador com 29 páginas, 87 critérios aprovados e zero ocorrências no conjunto executado; testes de planejamento, gestão das práticas e PWA.
- GitHub Actions `42023429753`, em 05/11/2026: job `testar` concluído com `success`, abrangendo testes do planejamento e das práticas em navegador.
- Evidências: https://github.com/gustavoguterman-gif/gastroiff/actions/runs/42023429473 e https://github.com/gustavoguterman-gif/gastroiff/actions/runs/42023429753.
- **Limitação essencial:** execuções são da PR 26 em rascunho, não comprovam o estado visual da publicação atual nem autenticação, armazenamento ou políticas RLS em serviço Supabase real. Não incorporar a PR 26 sem homologação autorizada com identidades fictícias.
- **Fase 0 de 11 continua aberta.** Reavaliar a versão mais recente da branch principal antes de aceitar os testes como homologação do site publicado.

## Verificação do teste remoto de perfis (06/11/2026)

- Identificada lacuna na auditoria `tests/site-publicado-navegador.cjs`: a verificação da tela inicial reconhecia somente versões 4 a 7 de `perfis-publicos.js`, enquanto a página pública declara a versão 9. O teste podia terminar sem verificar a abertura, os botões de perfil e a repetição da animação nessa versão.
- Corrigida a detecção para identificar a presença do módulo versionado sem fixar versões antigas. Atualizada a regra de estilo para `site.css?v=20261106-motion2` e a lista esperada do seletor para visitante, estudante, docente e egresso.
- A rotina completa já existe em `.github/workflows/validacao-completa.yml` com acionamento em `push` e `pull_request` na `main`; não criar rotina geral duplicada.
- A mudança está registrada no código, mas **a aprovação da execução após a correção ainda não foi confirmada**. Também permanece pendente homologação visual manual e do serviço de autenticação real.

## Falhas reais de CI identificadas e correção dos perfis (06/11/2026)

- Foram localizadas notificações efetivas de falha dos workflows do GitHub em 06/11 e analisados os logs oficiais, não apenas os assuntos dos e-mails.
- Na execução da conferência do site publicado `42311455411`, o teste de navegador falhou em `tests/site-publicado-navegador.cjs`: encontrou **4** perfis de entrada, mas ainda exigia **3**. A interface pública `assets/perfis-publicos.js` contém corretamente Visitante, Estudante, Docente e Egresso. Trata-se de teste obsoleto, não de comprovação de falha da própria interface.
- A execução da validação completa `42290550470` sofreu o mesmo erro. Antes disso, os logs confirmam a aprovação do fluxo de Gestão em celular, tablet e desktop, PWA em mobile e desktop, e auditoria de 29 páginas x 3 tamanhos, com **87 de 87** verificações aprovadas e **0** ocorrências bloqueantes. O relatório anotou 15 avisos de largura de seletores, classificados como não bloqueantes, sujeitos a inspeção estética posterior.
- Corrigidos três pontos de expectativa em `tests/site-publicado-navegador.cjs`: contagem de botões, sequência dos perfis e textos após recarga para quatro perfis. **Não afirmar que a execução posterior está aprovada antes de obter os logs.**
- Permanecem necessárias validação da publicação mais recente nos três formatos, inspeção das capturas, e homologação da Gestão com infraestrutura protegida real.

## Segunda falha da conferência publicada: texto decorativo nos perfis (06/11/2026)

- A execução `42311933932` do teste do site publicado chegou ao passo de recarga da página inicial e falhou na comparação literal dos rótulos: os botões atuais exibem `Visitante›`, `Estudante›`, `Docente›`, `Egresso›`, enquanto a auditoria esperava o texto sem a seta decorativa.
- Conferido o módulo `assets/perfis-publicos.js`: o nome acessível fica em `.gi-entry-card-label`; a seta tem `aria-hidden=true`. Corrigida a auditoria para comparar somente os textos desse elemento, mantendo a ordem e os quatro perfis obrigatórios.
- **A execução posterior ainda não foi conferida**. A correção não declara aprovação visual. O CI anterior, `42290550470`, registrou 87 de 87 verificações locais aprovadas em celular, tablet e desktop, além de 15 avisos de largura de seletores classificados como não bloqueantes, a serem avaliados em capturas.

## Terceira falha remota: contagem geral dos links de contato (06/11/2026)

- Nos workflows `42312799572` (site publicado) e `42312737926` (validação completa), o teste remoto reprovou em Contato, resolução celular, porque a consulta global `a[href="tel:+552226459500"]` encontrou **dois** elementos, enquanto o teste exigia exatamente um. No HTML-fonte da seção de Contato existe um botão próprio de ligação e um de WhatsApp.
- Corrigido `tests/site-publicado-navegador.cjs` para restringir a consulta aos botões da área `.contact-phone-actions` com as respectivas classes `.gi-contact-call` e `.gi-contact-whatsapp`. Assim, não se presume que não existam outros links de telefone em áreas de navegação; a verificação continua exigindo um botão de cada tipo, visível e com altura mínima de 40 px.
- Conferidos os seletores no HTML atual, mas **a execução posterior do workflow ainda precisa ser acompanhada**. A auditoria local anterior passou por 29 páginas x 3 formatos, com 87 de 87 verificações sem erros bloqueantes; os 15 avisos sobre largura de seletores ainda requerem inspeção visual.

## Evidência visual automática em caso de falha (06/11/2026)

- Em `tests/site-publicado-navegador.cjs`, cada uma das sete páginas verificadas em 390 px (celular), 768 px (tablet) e 1440 px (desktop) agora produz, em caso de reprovação, uma captura `-falha.png` e um diagnóstico `-falha.json`, contendo página, formato, largura, altura, motivo e erros de JavaScript. A captura é tentada antes do encerramento da página e não substitui a causa original da falha.
- A estrutura de `reports/` já é guardada como artefato pelo workflow de validação completa, inclusive quando há erro. A sintaxe JavaScript do teste alterado foi conferida, mas **o novo fluxo de capturas em navegador e a execução subsequente ainda não foram homologados**.
- A última falha da validação completa identificada nos logs (execução `42312737926`) era uma contagem global de links telefônicos e foi corrigida anteriormente em `4ad48e2`. Nenhuma nova falha posterior a essa correção foi comprovada nos resultados consultados neste momento.

## Falha remota de área de toque na página Contato (07/11/2026 UTC)

- A execução `42329314481` do workflow publicado falhou na página Contato, versão celular, ao verificar a altura dos botões de ligação e WhatsApp. O registro anterior não trazia as dimensões exatas; portanto, **não é possível concluir pelo log antigo se o botão era realmente pequeno ou se a medida foi afetada por transformações visuais**.
- O teste em `tests/site-publicado-navegador.cjs` agora mede `offsetHeight` (área de layout) para exigir pelo menos 40 px e registra `getBoundingClientRect()`, `minHeight` computado e visibilidade no erro, distinguindo a área de toque de animações CSS. Mantida a verificação da presença e visibilidade de ambos os links.
- Foi verificada a sintaxe do script, mas a execução após a alteração `7eb3e285` não foi comprovada. Se a área efetiva continuar inferior a 40 px, ajustar o CSS e repetir os testes em celular, tablet e desktop; não baixar o requisito para fazer o teste passar.

## Inspeção de capturas reais dos três formatos (07/11/2026 UTC)

- Recuperado o artefato real `validacao-completa-gastroiff` da execução GitHub Actions `42312737926` (artefato `13550100498`, 75 arquivos). O relatório `auditoria-geral.json` foi aberto, não apenas inferido do texto do log: **29 páginas, 3 resoluções, 87 verificações aprovadas, 0 ocorrências bloqueantes, 15 avisos visuais**.
- Foram abertas e comparadas as imagens da **página inicial** e da **Gestão fictícia** em celular (390 px), tablet (768 px) e desktop (1440 px). Na parte inicial das telas examinadas não foram identificados cortes horizontais evidentes; a composição e o formulário se reorganizam para as três larguras. Essa inspeção **não equivale** à avaliação integral das páginas longas nem às telas do Contato que não constavam desse artefato.
- Os 15 avisos de `wideSelects` correspondem a seletores de formulário largos, principalmente em Gestão, Ocorrências e Participação. O relatório não indica itens cortados (`clipped: []` nesses registros). Não reduzi automaticamente os campos, pois a largura integral em formulário mobile pode melhorar o uso; cada aviso ainda requer conferência contextual antes de eventual ajuste visual.
- O teste do **site publicado** da execução `42312737926` falhou posteriormente na checagem do botão de Contato. A correção do teste e a captura de falhas foram incorporadas depois; **a validação do site publicado na versão mais recente ainda não foi comprovada**. Nada autoriza concluir a entrega 2 nem ativar a Gestão protegida.

## Correção comprovada de conflito CSS no Contato (07/11/2026 UTC)

- Analisados logs das execuções `42329782395` e `42329698826`. A página Contato no celular mostrava botões de chamada e WhatsApp com `layoutHeight:36`, `minHeight:"36px"`, e larguras próximas a 87 e 113 px, contrariando o requisito de no mínimo 44 px de área de toque.
- A folha global `assets/institutional.css` contém regra de redução de botões com `min-height:36px!important`. O CSS local `contato.html` definia 44 px sem prioridade equivalente, por isso perdia no conflito de cascata. Atualizado o seletor específico dos dois controles para impor `min-height:44px!important`, `width:100%!important`, `display:inline-flex!important` e padding coerente. O arranjo mobile de uma coluna permanece definido abaixo de 400 px.
- Adicionado teste estático em `tests/integridade-site.test.mjs` para impedir a remoção futura da prioridade de 44 px. O teste de navegador continua medindo altura computada e visibilidade nos três formatos.
- **Ainda falta obter execução posterior dos workflows e inspecionar capturas atualizadas**. Não registrar aceite da entrega 2 até essa comprovação.

## Correção adicional após reprovação de 36 px no Contato (07/11/2026 UTC)

- A execução publicada `42330110729`, já posterior à primeira tentativa de correção, ainda mediu **36 px** de `layoutHeight` e `minHeight` nos botões telefônico e WhatsApp em celular 390 px. Logo, a primeira alteração do CSS não foi suficiente para comprovar a solução.
- Aplicada declaração explícita `min-height:44px!important` nos dois links de Contato, bem como padding e `box-sizing` locais, para prevalecer sobre a regra de 36 px do CSS global. A regra de layout responsivo continua intacta.
- O teste estático de integridade passou a exigir essa declaração nos dois botões. O HTML atualizado foi conferido e ambos os botões passaram na verificação de presença e da altura definida. **Ainda falta testar no navegador publicado em celular, tablet e desktop e inspecionar as capturas**, sem declarar homologação antecipadamente.
