# GASTROIFF | Mapa de construção, compromissos e entregas
Versão 1, 04/11/2026. Documento de continuidade do projeto.

## O que este arquivo significa
Este é o inventário de requisitos e entregas, a ser atualizado a cada fase. A existência de uma página no GitHub não significa que o serviço esteja integralmente funcionando. Os itens são classificados como:
- **Implementado no código:** arquivo ou comportamento consta do repositório, mas pode precisar de teste no navegador publicado.
- **Operacional limitado:** permite uma ação concreta, porém depende de e-mail/aplicativo externo ou intervenção manual.
- **Preparado:** interface ou especificação está criada, sem integração completa.
- **A construir:** serviço ainda inexistente.
- **Conferir:** conteúdo, fontes ou comportamento precisam ser verificados antes de afirmação pública.

A construção seguirá fases pequenas, com endereço de teste, critério de aceite, resultado esperado, limites e registro das correções. Não alterar páginas já aprovadas sem necessidade.

## Princípios decididos
1. **Três ambientes conectados:** portal público GASTROIFF, Observatório da Formação e da Utilização, e Gestão GASTROIFF com acesso protegido.
2. **Três públicos principais:** estudantes e professores, interessados em ingressar e comunidade externa; mais uma interface simples para administração individual.
3. **Papel da plataforma:** formar, informar, criar oportunidades de participação, pesquisar, avaliar a formação e produzir devolutivas institucionais concretas.
4. **Gestão que reduz trabalho:** uma caixa de entrada; recebimento, triagem, perguntas objetivas para dados faltantes, prévia, aprovação, publicação e histórico; alertas úteis por e-mail; resumos periódicos; lembretes e detecção de links quebrados e prazos.
5. **Linguagem cotidiana:** perguntar o que a pessoa quer realizar, evitar nomes de formatos de arquivo. O sistema deve explicar claramente o que aconteceu e o que ainda depende de envio ou aprovação.
6. **Dados confiáveis:** fontes verificadas, datas explícitas, limite de validade, atualização, distinção entre atividade prevista e atividade confirmada. Não inventar horários, vagas, parceiros, resultados ou diagnósticos.
7. **Currículo amplo:** técnicas culinárias e domínio de cocções são tecnologias essenciais, entre outros conhecimentos de microbiologia, nutrição básica, higiene e segurança, gestão, cultura alimentar, história, antropologia, sociologia, ciência, desenvolvimento de produtos, didática, equipamentos, equipes e métodos de pesquisa.
8. **Referências de outras instituições como inspiração de métodos:** IFSC campus Florianópolis-Continente, IFB, IFBA, UFC, UFRJ, Escola de Gastronomia Social Ivens Dias Branco, Senac Ceará e políticas públicas de Gastronomia do Ceará orientam ideias e instrumentos, sem fazer do portal uma vitrine de marcas/instituições.
9. **Território:** priorizar a Baixada Litorânea e Região dos Lagos; considerar Cabo Frio, Búzios, Arraial do Cabo, São Pedro da Aldeia, Araruama, Iguaba Grande, Saquarema e outros municípios pertinentes. A Baixada Fluminense é outra região e deverá ser tratada em filtro próprio.
10. **Pesquisa e extensão:** ambas são possibilidades a formalizar. Preparar projeto(s) e metodologia de avaliação somente após estrutura e testes; não anunciar aprovação institucional antecipada.
11. **Governança:** o projeto continua sob responsabilidade do professor depois do exercício da coordenação. E-mail particular confirmado para alertas de gestão quando o sistema seguro estiver ativo; demandas institucionais seguem os canais funcionais autorizados dos cursos. Não encaminhar respostas identificáveis de estudantes indiscriminadamente ao e-mail pessoal.
12. **Privacidade:** não armazenar respostas de questionários, fotos, dados de egressos nem processos pessoais no GitHub Pages. Usar banco protegido, permissões, autenticação, retenção, backups e avaliação institucional das finalidades.

## Inventário do portal público existente
As páginas abaixo foram confirmadas como arquivos no repositório durante esta construção, sem certificar teste visual em navegador real:
- Apresentação e cursos: `index.html`, `cursos.html`, `sobre.html`.
- Comunidade, equipes, perfil: `docentes.html`, `perfil.html`, `contato.html`.
- Pesquisa, periódicos, acervo e livros: `pesquisa.html`, `revistas.html`, `biblioteca.html`, `acervo.html`, `livro.html`.
- Ensino, laboratórios e documentos: `praticas.html`, `laboratorios.html`, `manual-laboratorio.html`, `documentos.html`.
- Extensão/território, calendário e oportunidades: `projetos.html`, `eventos.html`, `oportunidades.html`.
- Pesquisa de formação já existente: `observatorio.html`. Deve ser preservada.
- PWA, calendário e recursos: `manifest.webmanifest`, `sw.js`, agendas ICS, CSS e JavaScript compartilhados.
- As regras de identidade visual, nome do campus, botões verde claro, alinhamento à esquerda, logotipos aprovados, acessibilidade e responsividade estão em `GUIA-MANUTENCAO.md`.
- Verificar pendências bibliográficas, docentes, conteúdo, PWA e links registradas anteriormente em `AUDITORIA.md`; entradas de 01/11 podem ter sido alteradas posteriormente, exigindo nova auditoria antes de serem consideradas atuais.

## Inventário das novas construções de 04/11
| Recurso | Arquivo | Situação confirmável | Ainda falta |
| --- | --- | --- | --- |
| Participação Acadêmica | `participacao.html` | Operacional limitado: prepara e-mail para coordenações; agora recebe tema sugerido pelos percursos | envio diretamente no site, foto anexa, protocolo e acompanhamento |
| Livro de Ocorrências e Necessidades | `ocorrencias.html` | Operacional limitado: formulário e prévia local de foto; requer anexar foto e enviar o e-mail | banco privado, upload de foto, avisos, protocolo, status e devolutivas |
| Central de Gestão | `gestao.html` | Preparado: organização inicial e importação/revisão local de calendário ICS | acesso protegido, caixa única de entrada, vários formatos, IA, publicação assistida e notificações |
| Observatório de Utilização | `painel.html` | Preparado: layout, importação local de relatório e explicação de devolutivas | ativar coleta, GA4/API ou tecnologia escolhida, filtros e métricas reais |
| Observatório da Formação | `observatorio.html` | Página anterior existente, preservada | resultados e pesquisas vinculadas aos instrumentos que serão desenvolvidos |
| Trajetórias e campos profissionais | `trajetorias.html` | Implementado no código: caminhos profissionais e links para aprofundamento | mapa real de disciplinas e relatos autorizados de egressos |
| Gastronomia em ação | `gastronomia-em-acao.html` | Implementado no código: percursos regionais, fontes, passos e relação com a formação | mais municípios, casos documentados, relações precisas com PPCs, oportunidades externas atualizadas |
| Atividades futuras nos percursos | `gastronomia-em-acao.html` + `assets/events.js` | Implementado no código: filtra pelo dia atual as atividades futuras já cadastradas | pesquisa automática de novos editais, reuniões e oportunidades, confirmação de inscrição/validade |
| Proposta a partir de percurso | `gastronomia-em-acao.html` -> `participacao.html` | Implementado no código: leva título e contexto ao formulário sem pedir repetição | vínculo com fluxo protegido de propostas e avaliação institucional |
| Auditoria semanal do calendário | `.github/workflows/conferir-vigencia.yml` e `scripts/auditar_vigencia.py` | Código de rotina agendada criado: revisa campos e eventos próximos, tenta abrir ou atualizar issue no GitHub | confirmar execução real, permissões e funcionamento; não descobre novos eventos |
| Arquitetura de dados | `ARQUITETURA-GESTAO-DADOS.md` | Especificação escrita | provisionamento, credenciais, execução e segurança |
| Estrutura protegida inicial | `supabase/migrations/202611040001_gastroiff_base.sql` | Migração SQL preparada no código, não executada em servidor | selecionar/provisionar serviço, testar permissões, implantar autenticação e recebimento real |
| Recebimento seguro de ocorrência | `supabase/functions/receber-ocorrencia/index.ts`, `validation.mjs` | Backend preparado e testes unitários no GitHub; ainda não implantado | instalar serviço protegido, configurar antispam, ligar formulário, executar testes integrados e ativar notificações |

## Oportunidades: compromisso integral
O banco público deverá aceitar emprego, estágio, concurso, edital, bolsa, seleção acadêmica, extensão, formação, projetos e oportunidades comunitárias. Deve apresentar função, empregador/organização, cidade, modalidade, requisitos, prazo, remuneração informada, contato público, canal direto de candidatura e data da última conferência. Priorizar busca automática permitida em sites de empresas, restaurantes, hotéis, pousadas, municípios, instituições e bancos de vagas, depois expandir a Instagram e Facebook apenas com meios autorizados. Deduplicar, identificar encerramento e registrar fonte. Não dar como automática uma busca que não esteja realmente ativa. Produzir indicadores de exigências profissionais e campos emergentes, sem confundir clique com contratação.

## Experiências educativas e atuação social: compromisso integral
Criar percursos com **caso documentado e datado**, necessidade identificada, pessoas e organizações que atuam no tema, conhecimentos da formação, possibilidades técnicas e de pesquisa, passos de aproximação, contatos oficiais quando confirmados e chamadas públicas/reuniões/inscrições quando realmente vigentes. Articular com atividades existentes do GASTROIFF (IF na Feira, SAGA, Semana Acadêmica, Café com Egressos, Portas Abertas, Caminhos da Gastronomia), sem inventar vínculos institucionais.
Temas: políticas públicas alimentares, conselhos e câmaras municipais, alimentação escolar, agricultura familiar, distribuição e escoamento, pesca e extrativismo, cozinhas solidárias, combate à fome, materiais educativos para escolas, patrimônio e cultura alimentar, treinamento culinário e de equipes, pesquisa, desenvolvimento de produtos, inovação, empreendedorismo, gestão de equipamentos e processos, turismo e hospitalidade, gestão de serviços, comunicação e ensino. O estudante deverá entender como começar e por que cada disciplina importa, inclusive o saber cozinhar.

## Avaliação, pesquisa e devolutivas
- Instrumentos digitais internos com questionários condicionais, sem depender continuamente de exportações do Google Forms, acessíveis pelo próprio portal.
- Ingresso: origem do interesse, condições prévias, expectativas e barreiras de acesso.
- Permanência: horários, trabalho, transporte, alimentação, apoio, infraestrutura, pertencimento, dificuldades e projetos.
- Currículo: disciplinas, sequências, cargas, práticas, pesquisa, extensão, avaliação, estágio, acessibilidade e condições de ensino.
- Conclusão: integralização, atividades complementares, estágio, obstáculos e contribuição percebida.
- Egressos Técnico e Tecnólogo: cadastro voluntário, atualização longitudinal na conclusão, 6 e 12 meses, 3 e 5 anos; múltiplas áreas de atuação; trabalho formal/informal, empreendimentos, pesquisa, docência, políticas públicas, participação social, território, mobilidade, renda por faixa, formação posterior e lacunas curriculares.
- Comunidade e organizações: necessidades sociais, prioridades dos parceiros, oportunidades e percepção de resultados.
- Indicadores oficiais do SUAP/PNP somente mediante autorização e definições metodológicas compatíveis; coleta própria não substitui registro acadêmico.
- Resultados com denominador, recorte, data, versão das perguntas, taxa de resposta e limitações; agregação e prevenção de reidentificação.
- Recomendações para coordenação, NDE, Colegiado, Direção de Ensino, extensão e setores técnicos, com diagnóstico, evidências, propostas, responsável funcional, retorno, decisão, execução e avaliação posterior.
- Pesquisa e extensão podem produzir relatórios, publicações e avaliações sem divulgar dados individuais. Distinguir alcance do portal, participação, satisfação e impacto efetivamente verificado.

## Experiência administrativa: compromisso integral
Uma só central, organizada por urgência, estado, prazo e próximo passo; informar “recebidos”, “dependem de você”, “aguardam terceiros”, “vencem em breve” e “concluídos”. Upload de imagem, PDF, planilha, texto, ICS e documentos de pesquisa; extração orientada por IA com validação, solicitação apenas de dados essenciais faltantes, revisão e confirmação antes da publicação; alterações sincronizadas em páginas, calendário e arquivos de agenda. Alertas imediatos somente para assuntos urgentes e resumos configuráveis dos demais. Perfis e responsabilidades atualizáveis sem editar código. Rastreabilidade, reversão, acessibilidade, linguagem simples e cuidado com informações pessoais.

## Sequência revisada de implantação e aceite
### Fase 0. Consolidação, auditoria e proteção do que já existe
Entregáveis: mapa integral atualizado; verificação estática; revisão de riscos; critérios de cada fase; links das páginas. Aceite: nenhum requisito perdido e situação de cada serviço clara. **Em execução, com este documento como primeira entrega.**

### Fase 1. Informação pública útil e percursos conectados
Entregáveis: mapa das áreas, percursos regionais, ligação com eventos futuros internos, conexão de proposta já preenchida e ajustes de navegação; revisão de fontes. Aceite: estudante consegue escolher percurso, conhecer aplicação e enviar proposta sem reescrever o tema. **Parcialmente construído.**

### Fase 2. Infraestrutura segura de administração
Etapa inicial concluída no código em 04/11: modelo de tabelas, regras de acesso, armazenamento de anexos privado, função de recebimento e suíte de testes no GitHub. Guia de ativação em `FASE-2-ACESSO-PROTEGIDO.md`. Nenhum banco em funcionamento, envio real ou login ativo foi afirmado.
Entregáveis: autenticação, serviço de dados, permissões por papel, arquivos privados, política de dados, backup e área protegida. Aceite: dados pessoais não aparecem no GitHub Pages; administrador acessa somente após login; teste de envio e recuperação. **A construir.**

### Fase 3. Livro de Ocorrências e Participação efetivos
Entregáveis: envio sem abrir e-mail, foto anexada, número de registro, triagem, notificação, resposta e acompanhamento; relatórios agregados. Aceite: relato de teste chega à central e ao responsável autorizado, tem status e devolutiva verificável. **A construir.**

### Fase 4. Banco de Oportunidades e agenda atualizados
Entregáveis: fontes de busca permitidas, rotina de coleta, filtro regional, verificação do anúncio e validade, publicação e despublicação com rastreabilidade, editais e reuniões. Aceite: descoberta nova rastreável a fonte, sem duplicatas, inscrição funcional e alertas de erros. **A construir; há apenas filtro automático do catálogo interno e primeira auditoria de eventos.**

### Fase 5. Publicação assistida e gestão de conteúdo
Entregáveis: envio de arquivos, leitura e proposta de alteração de vagas, eventos, docentes, perfis, pesquisa, materiais, extensão e documentos; aprovação e atualização sincronizada. Aceite: atualizar um evento multidiário uma única vez e verificar página, calendário e link/arquivo de agenda. **A construir.**

### Fase 6. Pesquisas digitais e acompanhamento de egressos
Entregáveis: construtor de formulários, perguntas condicionais, consentimento, cadastro longitudinal de egressos, resultados agregados e importação de resultados históricos do Forms. Aceite: pesquisa real respondida em dispositivo móvel, dado protegido, gráfico atualizado e exportação de relatório sem exposição pessoal. **A construir.**

### Fase 7. Observatório e ação institucional
Entregáveis: métricas de acesso confiáveis, indicadores formativos, análises por coorte, estudos regionais, recomendações e monitoramento de providências. Aceite: relatório verificável com dados, método, limitações e encaminhamento institucional com resultado documentado. **A construir.**

### Fase 8. Testes finais e projetos acadêmicos
Entregáveis: testes de links, acessibilidade, PWA Android/iOS, 360/390/768 px e desktop, automações agendadas, segurança, avaliação com usuários e redação do projeto de pesquisa e extensão (um projeto integrado ou submissões relacionadas, segundo normas). Aceite: funcionamento demonstrado e proposta fundamentada em evidências. **A construir.**

## Atualização de fases
Ao encerrar cada fase, registrar: data, arquivos alterados, links, o que foi testado, falhas encontradas, o que não funciona ainda, próximo passo e aprovação do responsável. Não declarar uma funcionalidade automática sem comprovar a rotina e o serviço de destino.

## Arquivos que compõem o histórico
`PLANO-MESTRE-GASTROIFF.md`, `ARQUITETURA-GESTAO-DADOS.md`, `GUIA-MANUTENCAO.md`, `AUDITORIA.md`, este documento e o histórico de commits do repositório.

## Incremento validado em 04/11: identificação simples no Livro de Ocorrências
- Ao escolher **Docente**, o formulário `ocorrencias.html` mostra uma lista de nomes proveniente do próprio cadastro `assets/faculty.js`, excluindo os dois perfis técnico-administrativos cadastrados. A lista é de conveniência, não constitui autenticação do(a) docente. Se a lista falhar, o formulário não deve simular escolha válida.
- Ao escolher **Estudante**, solicita apenas nome completo, sem exigir número de matrícula. E-mail para retorno continua opcional. Para outros vínculos, nome pode ser opcional.
- A versão pública ainda prepara envio pelo aplicativo de e-mail e não envia foto automaticamente. O backend planejado exige nome para docentes e estudantes e consentimento explícito para guardar qualquer identificação pessoal no banco.
- Foram adicionados testes de interface estática, exclusão de perfis não docentes, carregamento de cadastro e sintaxe de JavaScript, além dos testes de validação e checagem de tipos do serviço protegido.
- O fluxo de backend foi preparado mas ainda não foi ativado. A execução real e os testes de permissões em banco dependem da infraestrutura protegida.

## Retomada integral e personalização inicial (04/11/2026)
- Criado `CADERNO-COMPLETO-GASTROIFF.md`, inventário detalhado de decisões desde a identidade visual, logos, biblioteca, revistas, equipe, links, calendário e PWA até percursos formativos, oportunidades, perfis, Google Drive, compras, cronogramas docentes, pesquisa e Observatório.
- A fase de **personalização pública por perfil** foi iniciada no código: `assets/perfis-publicos.js`, `assets/perfis-publicos.css` e integração na página inicial. Perfis visitante, estudante, docente, egresso(a) e comunidade externa mudam destaques e acessos sem restringir páginas públicas; escolha salva localmente, sem matrícula ou coleta de dados pessoais.
- O código do aplicativo offline passou a incluir os dois recursos e teve o cache atualizado para `gastroiff-offline-v43`.
- A fase 0 ganhou auditoria estática `tests/integridade-site.test.mjs` e workflow `.github/workflows/integridade-site.yml`. A primeira execução aprovada foi verificada em 04/11. Isto só valida sintaxe de arquivos JavaScript e caminhos declarados de recursos locais; links externos e interface real dependem de testes adicionais.
- Novo teste de navegador foi preparado em `tests/verificar-perfis-navegador.cjs`, verificando celulares, tablet, desktop, persistência do perfil, lista docente e rolagem horizontal; conferir resultados do workflow antes de declarar os testes visuais aprovados.
- Alternativa Drive/Planilhas/Apps Script permanece em **avaliação técnica**, não foi provisionada. O banco Supabase também está preparado, não ativo. Não decidir hospedagem de dados pessoais apenas por capacidade de armazenamento; avaliar permissões, cotas, responsabilidades, LGPD, backups, manutenção e integração com o IFF.
- Próxima construção: resolver falhas apontadas na auditoria de navegador e iniciar painel docente com ciclos, solicitações de insumos, prazos e links a ocorrências, **sem inventar status de compras ou horários**.

## Fechamento desta rodada de teste
- Conferência estática de arquivos locais e scripts aprovada.
- Personalização simples por perfil e lista de docentes testadas em navegador para celular, tablet e desktop.
- Auditoria geral de 25 páginas em celular e desktop: 50 verificações, zero ocorrências após corrigir a sintaxe de `gestao.html`.
- Importação de um único evento multidiário na Gestão testada e aprovada, com término inclusivo e exportação de rascunho, sem publicação automática.
- Pendências desta fase: teste humano visual de todas as páginas, conferência externa de URLs, busca automática de novos editais e vagas, cadastro real de usuários, Drive/Apps Script ou banco protegido provisionado, compras e notificações com dados reais.

## Incremento de 04/11/2026: Planejamento docente e decisão de infraestrutura
- Criada `planejamento-docente.html`, com cadastro local de ciclos de práticas (docente escolhido na lista já existente, curso, disciplina, local, início e término). A tela calcula prazos relativos à data local, evidencia conferência de insumos e equipamentos e oferece exportação CSV.
- Arquivos associados `assets/planejamento-docente.css` e `assets/planejamento-docente.js`. Sem acesso a informações institucionais de compras, sem registro no servidor, sem e-mails e sem calendário oficial sincronizado; o usuário informa seus próprios ciclos e pode apagar os registros do dispositivo.
- Acesso incluído no menu Ensino e nos destaques da página inicial quando escolhido o perfil docente. Cache do PWA atualizado para v44.
- Testes de navegador: `tests/planejamento-docente-navegador.cjs` e workflow `.github/workflows/testar-planejamento-docente.yml`, com verificações de calendário inconsistente, duplicata, persistência local, exportação, exclusão, carregamento e largura em celular, tablet e desktop.
- Criado `DECISAO-INFRAESTRUTURA-DRIVE.md` com critérios para testar Drive/Planilhas/Apps Script e Supabase antes de comprometer dados reais. Nenhuma conta, pasta, automação de envio ou banco foi conectada.
- Critério da próxima fase: testar uma planilha de ciclos e insumos com dados fictícios e a atualização confiável do status pela fonte responsável. Lembrete automático de 7 dias depende de integração programada e confirmação de destinatário, sem previsão de entrega inventada.

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


## Convenção de entrega por fase e revisão do cabeçalho (05/11/2026)

A sequência integral do projeto contém **9 fases numeradas de 0 a 8**. Ao concluir cada entrega, a comunicação deverá informar o número da fase de referência e o total de 9, o estado de conclusão da fase integral (parcial ou concluída) e o endereço público https://gustavoguterman-gif.github.io/gastroiff/ para conferência. Uma correção visual pontual não implica concluir toda uma fase de implantação. A infraestrutura protegida da Fase 2 permanece pendente de homologação real, embora os testes preparatórios estejam avançados.

Correção transversal de interface desta rodada: cabeçalho nas larguras de 360, 390, 768 e 1440 px com três ações do lado direito menores, de largura e altura iguais, alinhadas e sem sobreposição da marca. No celular, a legenda visível de Localização fica abreviada para "Local", enquanto o nome acessível completo permanece no elemento. Mantém as funções de contato, mapas e instalação do aplicativo, sem modificar conteúdos públicos nem autenticação. Requer CI e conferência do site publicado.
