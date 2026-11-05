# GASTROIFF | Auditoria de decisões, matriz de rastreabilidade e plano executivo
Data da auditoria: 05/11/2026.
Documento complementar obrigatório ao `CADERNO-COMPLETO-GASTROIFF.md`, `PLANO-MESTRE-GASTROIFF.md`, `MAPA-CONSTRUCAO-GASTROIFF.md`, `AUDITORIA.md`, `GUIA-MANUTENCAO.md`, `ARQUITETURA-GESTAO-DADOS.md` e demais arquivos históricos. Nenhum deles é revogado ou resumido por este registro.

## Método, alcance e honestidade
A revisão cotejou o Caderno Completo existente no ramo principal (cerca de 82 mil caracteres), as expansões da proposta #27 (mais de 92 mil caracteres), o Plano Mestre, o Mapa, o Guia de Manutenção, a Auditoria e a Arquitetura de Gestão; relembrou decisões registradas nas conversas do projeto e conferiu commits e PRs disponíveis no repositório. A recuperação de toda fala de conversas antigas não é demonstrável somente a partir desses arquivos. Portanto, esta matriz é um instrumento de rastreabilidade crescente, não uma declaração de que absolutamente toda fala histórica já foi recuperada.

Situação em 05/11/2026: `main` encerra na revisão #25; as propostas #26 (autenticação), #27 (constituição) e #28 (densidade das oportunidades) estão separadas e em rascunho. Na data da auditoria, os workflows de CI de #28, runs 42026549364 e 42026549347, terminaram com sucesso; a inspeção humana detalhada da experiência não decorre automaticamente desses resultados. #26 possui testes de CI aprovados, mas a homologação em Supabase real isolado não foi executada. Fases descritas como aprovadas em testes simulados não são consideradas implantadas em infraestrutura institucional.

## Regras imutáveis de construção
R1. Preservação integral dos pedidos, histórico, escolhas, exceções e justificativas; atualizar por adição e remissões, sem apagar informação preexistente.
R2. Toda demanda nova recebe um identificador de requisito, indicação de origem, dependências, fase, resultado esperado, responsável pela fonte, teste e estado.
R3. Desenvolvimento em ramo isolado, sem juntar alterações de autenticação, conteúdo e visual sem análise das dependências. Nunca testar código novo diretamente em produção.
R4. Regressão em celular (390x844 e amostra de 360px), tablet (768x1024) e desktop (1440x900), incluindo menu, cabeçalho, rodapé, layout, rolagem horizontal, conteúdo, botões, foco, toque, links, erros JS, PWA/cache e testes negativos de segurança quando aplicáveis.
R5. O status de uma implementação exige prova: proposta, código escrito, teste automático, inspeção visual, homologação real, publicação e operação diária são estados diferentes.
R6. Toda informação pública oriunda da internet deve ter, quando tecnicamente e legalmente possível, coleta, verificação de origem, revisão de links e validade, detecção de retificações e regra de expiração automática. Renovação editorial automática só ocorre sob critérios publicados e testados; casos duvidosos são enviados à fila de revisão.
R7. Dados acadêmicos individuais, anexos de prática, nome/matrícula/SIAPE e pesquisas identificáveis não podem depender apenas da escolha do perfil, nem ser armazenados ou exibidos no GitHub Pages. Autenticação e autorização no servidor são etapas próprias.
R8. Informações provenientes exclusivamente de responsáveis internos (planejamento de aula, fichas preparadas, atribuições, recebimento físico e aprovações) mantêm edição e aprovação humanas, com importação assistida e menos retrabalho.
R9. O projeto continua iniciativa acadêmica em construção até eventual tramitação; evitar afirmar aprovações institucionais não comprovadas e evitar protagonismo pessoal na apresentação.
R10. Alterações de código têm critério de reversão, histórico de versões e registro do resultado dos testes. Alertas técnicos devem ser agrupados para não inundar o e-mail do responsável.

## Inventário consolidado, com identificadores duráveis
Estado: EXISTENTE = página/recurso no repositório; PARCIAL = implementação ainda não completa; PROPOSTO = demanda documentada; BLOQUEADO = depende de autorização/homologação. O estado não significa implantação integral.

| ID | Requisito completo e legado a preservar | Estado em 05/11 | Macrofase |
| --- | --- | --- | --- |
| GI-01 | Marca aprovada (prato/garfo/IF), favicon circular, PWA instalável, cabeçalho fixo uniforme, rodapé de logos, contato/localização e transporte | PARCIAL, exige auditoria visual | A |
| GI-02 | Padrão de tipografia, títulos e subtítulos mobile, botões verdes claros alinhados, espaços e e-mails não cortados, sem rolagem horizontal | PARCIAL, revisão sistêmica | A |
| GI-03 | Apresentação acadêmica natural em dois parágrafos, identidade visual explicada antes da imagem; história do Técnico desde 2011 e graduação; sem clichês, sem “protótipo”, sem “saberes e sabores” | EXISTENTE, conferência editorial pendente | A |
| GI-04 | Tela inicial com marca e três escolhas Visitante/Estudante/Docente; escolha sem login obrigatório; troca de perfil; conteúdo público sempre acessível | PROPOSTO, mecanismo preliminar de perfis existe | A |
| GI-05 | Experiência visitante: cursos, ingresso, editais, calendário público completo com foco em prazos de matrícula, visitas, extensão e notícias pertinentes | PROPOSTO | B |
| GI-06 | Experiência estudante: percursos, disciplinas e PPC, materiais públicos, apoio acadêmico, calendário, estágio, oportunidades e pesquisa | PARCIAL | B |
| GI-07 | Experiência docente: disciplinas, ciclos, ficha, materiais/insumos, alertas, ocorrências e consulta restrita aos próprios registros | PARCIAL, integração protegida BLOQUEADA | D |
| GI-08 | Cursos Técnico e Tecnólogo, PPCs vigentes, matrizes, planos e pré-requisitos corretos, documentos públicos vinculados à fonte oficial | EXISTENTE, atualização editorial pendente | B |
| GI-09 | Equipe, docentes/TAEs, nome abreviado corretamente, Wellington/Marco/Daiana, fotos/círculos, Lattes, trabalhos e três publicações verificadas, Colegiado e NDE | PARCIAL, dados e links a auditar | B |
| GI-10 | Biblioteca física: capa, sinopse, busca, ficha bibliográfica e comprovação de exemplar, sem inventar disponibilidade | PARCIAL | B |
| GI-11 | Revistas acadêmicas do Brasil e mundo, com IFs, capas, foco editorial, edições e opção de tradução dos sites estrangeiros, links verificados | PARCIAL, automação ainda ausente | C |
| GI-12 | Pesquisa/extensão/território: SAGA, IF na Feira, Café com Egressos, Caminhos da Gastronomia, Portas Abertas, acervo, projetos, publicações e eventos datados | PARCIAL | B/C |
| GI-13 | Percursos aplicados: pesca, mandioca, agricultura familiar, escolas, cozinhas comunitárias, segurança alimentar, compras públicas, turismo e processos sociais locais | PARCIAL | B/C |
| GI-14 | Percursos profissionais detalhados, inclusive docência em IFs/universidades, requisitos reais por edital, formação continuada, pós-graduação, pesquisa e contribuição social | PROPOSTO, ampliação em #27 | C |
| GI-15 | Banco único de emprego, estágio, concurso, edital, docência, bolsas, cursos, pesquisa e extensão; filtros por município, requisitos, vínculo e validade | PARCIAL; monitor de fontes limitado | C |
| GI-16 | Oportunidades compactas: 3 colunas desktop, 2 tablet, 1 celular; não suprimir requisitos, fonte, prazos ou acesso | PROPOSTO em #28, CI aprovado, revisão visual pendente | A |
| GI-17 | Calendário unificado institucional, ingresso, seleção, eventos, políticas públicas, Gastronomia e prazos; ICS multidiário único e integração intuitiva | PARCIAL; monitoramento completo ainda ausente | C |
| GI-18 | Autonomia editorial: atualizações por fonte, classificação, deduplicação, verificações de URLs, retificações, expiração, recuperação e relatórios de falha | PROPOSTO, fragmentos existentes | C |
| GI-19 | Instagram e redes sociais apenas por integração autorizada, mantendo atribuição, atualização e tratamento de indisponibilidade | PARCIAL | C |
| GI-20 | Livro de Ocorrências/Participação: nome docente da lista, estudante nome simples, anexos, protocolo, triagem, responsável, resposta, histórico e alerta | PARCIAL, servidor BLOQUEADO | D |
| GI-21 | Gestão: caixa única de oportunidades, projetos, vagas, eventos, ocorrências e documentos, com filtros, revisão de PDFs/fotos/planilhas, aprovação e publicação sincronizada | PARCIAL, servidor BLOQUEADO | D |
| GI-22 | Ciclos e horários: registro pela Gestão, não editados pelo quadro docente; calendário, vínculos e disciplinas efetivos, histórico e versões | PARCIAL, homologação BLOQUEADA | D |
| GI-23 | Insumos: documentos Excel/PDF/JPEG, importação e conciliação, fornecedor, solicitado/confirmado/faltante/recebido, evidência original, revisão antes de aprovar | PARCIAL, homologação BLOQUEADA | D |
| GI-24 | Alertas automáticos em D-7, sem duplicidade, com leitura e confirmação docente; contatos e pagamentos oficiais nunca inferidos | PROPOSTO, testes de simulação | D |
| GI-25 | Autenticação, segregação docente/gestor, RLS, bucket privado, integridade SHA-256, logout e backup, custódia institucional | BLOQUEADO até Supabase real autorizado | D |
| GI-26 | Gestão e Pesquisa integradas com dados rastreáveis, aprovação humana de conteúdos sensíveis e controle de alterações publicado por versão | PARCIAL | D/E |
| GI-27 | Instrumentos próprios: ingresso, permanência, currículo, infraestrutura, conclusão, estágios, parceiros, estudantes e docentes | PROPOSTO | E |
| GI-28 | Pesquisa de egressos Técnico/Tecnólogo: conclusão, 6/12 meses, 3/5 anos, docência, trabalho, território, continuidade dos estudos e não resposta | PROPOSTO | E |
| GI-29 | Painel público atualizado com agregados e metodologia (universo, amostra, taxa de resposta, período, versão), proteção contra reidentificação | PROPOSTO | E |
| GI-30 | Observatórios da formação, uso e trabalho, analytics responsável, relatórios, ações e devolutivas ao NDE/Colegiado/coordenação | PARCIAL, dados reais e integração pendentes | E |
| GI-31 | Cadastro voluntário de avisos, consentimentos separados, opção de sair, nenhum e-mail particular recebendo dados acadêmicos sem autorização | PROPOSTO, backend BLOQUEADO | C/D |
| GI-32 | Implantação na versão pública e PWA Android/iOS, prevenção de cache antigo, testes no site publicado, links reais e acessibilidade | PARCIAL, auditoria contínua | A/F |
| GI-33 | Projeto de pesquisa e extensão a redigir com base nos dados e nas normas, sem declarar aprovação antecipada | PROPOSTO | F |

## Inconsistências e riscos identificados nesta auditoria
1. Os planos usam fases distintas: o Mapa tem 0–8, o Caderno 0–10 e o Plano Mestre outra sequência de 0–10; alguns status foram escritos antes de implementações posteriores. A tabela acima passa a determinar o vínculo entre requisito e fase, mas não apaga os roteiros antigos.
2. O documento-mãe repete “## 18” e outras numerações, preservadas como histórico. Novas decisões serão identificadas por ID de requisito e data, evitando colisão.
3. A automação de vagas está adiantada em poucas fontes, mas não implementa uma rede ampla de concursos, docência, estágios, bolsas e fontes locais.
4. A existência de URL de revista não comprova disponibilidade, foco editorial, edição ativa, ISSN nem candidatura ou submissão. O catálogo científico não tem ainda um mecanismo abrangente de redescoberta e retorno após indisponibilidade.
5. Validade de vaga por idade do anúncio (30 dias) é uma aproximação editorial: fonte e encerramento prevalecem. Uma oferta removida pela empresa pode expirar antes; uma retificação pode estender prazo.
6. A disponibilização inicial de três perfis não pode solicitar matrícula ou SIAPE como credencial nem esconder conteúdos públicos arbitrariamente; identidade para dados privados exige login verificado.
7. Registros em arquivos de GitHub, dados pessoais, consultas de visitantes, analytics e pesquisas de egressos exigem ambientes e governança distintos.
8. Scripts agendados não representam serviço que executa continuamente; atraso, pausa, limite e queda da fonte devem ser detectados e mostrados em painel de saúde. Nenhuma falha silenciosa.
9. Testes automáticos em 390/768/1440 não substituem comparação visual humana de páginas densas e testes de uso real; o critério é encontrar conteúdo com menos esforço, não eliminar a rolagem.
10. É necessária auditoria de todas as fontes, datas, retificações, links de pesquisa, perfis, revistas, editais e versões do PWA, além das falhas anteriores notificadas por e-mail.

## Macrofases integradas: menos solicitações de continuidade, mesma qualidade
As macrofases agrupam entregas grandes e coerentes. Cada uma tem subetapas verificáveis, registro de evidências e barreira formal de encerramento. Não dispensam pequenas correções de segurança descobertas no percurso.

### A. Preservação, navegação e desenho responsivo
Escopo: GI-01 a 04, GI-16, GI-32. Consolidar auditoria de páginas e design, fechar #28 após inspeção, ajustar cartões/listas em todo portal, construir entrada 3 perfis e troca de perfil com preferências locais. Preservar todas as rotas públicas e links legados.
Saída: comparação antes/depois, navegação funcional e tarefa de localizar informação em 360/390/768/1440 px; nenhuma falha crítica aberta, sem cortes de texto, sem rolagem horizontal.

### B. Conteúdo público correto e experiência acadêmica
Escopo: GI-05/06/08/09/10/12/13. Revisar páginas, PPCs e matrizes, bibliografia, Lattes e equipe, áreas de extensão, pesquisa e território; destacar calendário e ingresso para visitante; manter conteúdo público transversal.
Saída: cada recurso com responsável, origem, data e links; os três perfis encontram as informações sem duplicidade editorial.

### C. Motor de atualização automática, revista, edital, oportunidades e percursos
Escopo: GI-11/14/15/17/18/19/31. Construir registro universal de fontes e conectores permitidos; alimentar banco unificado de calendário, ingresso, vagas, docência, revistas e percursos; reavaliar validade; instrumentar recuperação de links; alertas opt-in.
Saída: fonte nova, mudança de prazo, link quebrado, revista recuperada, anúncio encerrado e duplicação detectados com testes e histórico; apresentação correta em todas as interfaces.

### D. Gestão e infraestrutura de dados acadêmicos
Escopo: GI-07/20–26/31. Finalizar e integrar #26 apenas após homologação real isolada, autenticação autorizada, armazenamento privado, backups, papéis, ocorrências, fluxos de documentos, compras, insumos, avisos D-7 e quadro docente somente leitura.
Saída: teste de três identidades fictícias, segregação, operações negadas, expiração, importação e reversão, envio de teste e rastreabilidade; nenhuma exposição pública.

### E. Pesquisa, egressos e observatórios
Escopo: GI-27 a 30. Pesquisar métodos nacionais, preparar instrumentos com versão e revisão, consentimentos, amostras e coleta segura, painel agregado atualizável e retorno institucional; diferenciar egressos Técnico e Tecnólogo e histórico.
Saída: teste de preenchimento e correção, dados fictícios, prevenção de reidentificação, taxa de resposta, exportação, cálculo de indicadores e painéis mobile/tablet/desktop.

### F. Auditoria final, operação e consolidação acadêmica
Escopo: todos os requisitos, especialmente GI-32/33. Validar o site realmente publicado, PWA instalado e atualizado, monitoramento periódico, segurança, acessibilidade, fontes, performance, relatórios de incidentes e propostas de pesquisa/extensão.
Saída: livro de evidências, testes periódicos, plano de recuperação e manutenção, critérios de aceite por requisito e panorama de pendências sem afirmações indevidas de aprovação.

## Sistema de atualização automática de fontes: contrato técnico obrigatório
### Registro único de fontes
Cada fonte terá: ID, categoria, órgão/editor, nome, URL canônica, URLs complementares, formato (API, RSS/Atom, OAI-PMH, HTML permitido, PDF, ICS), termos de uso/licença conhecidos, periodicidade planejada, prioridade, credenciais somente em serviço privado quando necessárias, último sucesso, última tentativa, estado de saúde, hash/ETag/Last-Modified quando disponível, política de expiração e contatos/rota de revisão.
Para cada item extraído: ID estável, fonte, URL original, título, categoria, município/curso, publicação, início/fim/prazo, modalidade, evidência textual, data de coleta, data de verificação, URL de retificação/supersessão, hash de conteúdo, estado editorial e versão anterior.

### Frequências iniciais propostas (ajustáveis por custo, criticidade e autorização)
| Nicho | Descoberta | Revalidar itens existentes | Política |
| --- | --- | --- | --- |
| Ingresso IFF e editais de matrícula | A cada 2 horas durante inscrições/chamadas; diário fora dessa janela | A cada 2 horas quando ativo | Detectar retificações e atualização de prazo, avisar sem replicar evento |
| Editais, concursos, seleções docentes e bolsas | A cada 6 horas quando próximos de abertura/prazo; diário no restante | Diário, e a cada 2 horas nas 48h finais se fonte permitir | Priorizar órgão emissor; requisitos específicos sempre vinculados ao edital |
| Calendário institucional IFF e retificações | Diário; a cada 6 horas em períodos críticos | Diário enquanto vigente | Verificar nova versão oficial; nunca sobrepor planejamento docente sem autorização |
| Vagas e estágios regionais | A cada 6 horas, de acordo com fonte | Diário; imediatamente quando a fonte informar encerramento | Distinguir anúncio localizado de seleção confirmada |
| Eventos, congressos, extensão e participação pública | Diário | Diário quando próximos; semanal em eventos distantes | Guardar inscrição, submissão, modalidade, fonte e data multidiária única |
| Revistas acadêmicas em catálogo | Semanal verificação de URL/edição; mensal busca de novos títulos | Semanal; diário na recuperação de falha temporária | Não inserir revista inadequada nem esconder por falha transitória única |
| Lattes, artigos e perfis públicos | Semanal para links, mensal para novidades editoriais | Semanal/mensal | Apenas dados verificáveis e pertinentes |
| Links gerais, botões e documentos públicos | Semanal; verificação em publicação | Semanal e após alteração | Redirecionamentos, 403, 404, 429, timeout tratados diferentemente |
| Redes sociais autorizadas | Conforme API disponível | Conforme cota/limites | Não prometer raspagem universal |
| Dados privados, ciclo, insumos, recebimento físico | Ao registrar edição autorizada e rotinas de alerta | Conforme responsáveis e prazos | Não inventar dados institucionais, recebimento ou disponibilidade |

### Máquina de estados da fonte e publicação
DESCOBERTA -> EXTRAÍDA -> VALIDADA (estrutura, identidade da fonte, datas e links) -> PUBLICÁVEL -> PUBLICADA -> REVALIDAÇÃO. Resultados possíveis: ATUALIZADA, RETIFICADA (com histórico), ENCERRADA, SUBSTITUÍDA, INDISPONÍVEL_TEMPORÁRIA, EXIGE_REVISÃO, RETIRADA. Separar estado da FONTE do estado do ITEM.
A falha de uma fonte não apaga imediatamente os itens; após tentativas com atraso progressivo, marcar verificação pendente, manter última data válida e evitar afirmar atualidade. Um 404 duradouro com confirmação de encerramento pode retirar o link ativo; 403/429 podem indicar bloqueio técnico, não extinção.
A publicação automática deve ocorrer apenas com fonte e esquema conhecidos, campos essenciais consistentes, URL confirmada, data coerente e ausência de contradição. Fontes novas ou dados ambíguos entram em revisão. Logs técnicos sem tokens ou dados pessoais.

### Revistas acadêmicas: descoberta, quarentena e retorno
Manter lista curada de revistas brasileiras e internacionais de Gastronomia e campos correlatos relevantes, com ISSN (quando houver), nome oficial, instituição, periodicidade editorial, objetivo, URL canônica, edições, idioma, miniatura autorizada e verificação de escopo. Pesquisar periódicos novos em registros/índices e sites editoriais, evitando inferir pertinência somente por palavra-chave.
Tentar verificação da página oficial e de uma página de edição. Ao detectar falha, repetir com espaçamento e testar rota canônica/redirect; separar falha transitória de descontinuação. Não exibir novo título nem despublicar uma revista automaticamente com base em uma única resposta HTTP; manter histórico e fila de revisão.
Quando uma revista anteriormente indisponível voltar a apresentar identidade consistente, acesso real às edições e pertinência previamente validada, restaurá-la no catálogo automaticamente após o número de confirmações definido nos testes. Revistas novas entram após verificação de escopo editorial, vínculos e URL. O catálogo público terá data da última conferência, sem links mortos apresentados como funcionais.
Utilizar APIs e metadados onde disponíveis (Crossref e outros índices para descoberta, OAI-PMH de editoras que o ofereçam); índices não substituem a página oficial. A tradução é opção de interface e não altera a revista de origem.
Referências técnicas: https://www.crossref.org/documentation/retrieve-metadata/rest-api/ ; https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows .

### Operação e autonomia sustentável
A programação pode começar com GitHub Actions para dados públicos e geração de arquivos sem dados pessoais, desde que haja teste de agendamento, permissões mínimas, limites de requisições e tratamento de interrupções. O cron do GitHub não garante execução no minuto exato e pode atrasar ou não disparar sob carga; não depender dele como única fonte de alertas críticos com prazo de horas.
Criar painel de saúde na Gestão: fontes esperadas, últimos sucessos, atrasos, falhas consecutivas, itens expirados, links reparados, retificações, revisões humanas e última publicação. Um resumo agrupado deve notificar exceções significativas, sem inundar a caixa de e-mail.
Reduzir o esforço humano verificando automaticamente o que puder ser validado de maneira confiável; reservar à coordenação e aos setores somente decisões, materiais próprios, dados oficialmente conferidos e conflitos de fonte.

## Protocolo de testes por macrofase
1. Inventário antes da alteração e backup da versão de referência; descrever o delta de requisitos.
2. Testes de unidade para importação, formato, URL, expiração, redirecionamentos, duplicatas, timezone, retificações e falhas transitórias.
3. Testes de integração com respostas simuladas e testes autorizados com fonte real. Não usar dados privados ou segredos no GitHub.
4. Playwright obrigatório em 390/768/1440 px, mais 360px para regressão; capturas antes/depois para alterações visuais e testes de navegação, foco, menus, PWA, cache e texto completo.
5. Verificar erros de console, ausência de rolagem horizontal, facilidade de localizar fonte, prazos e ação; inspeção humana de densidade e contraste. Métrica de menor scroll não pode diminuir legibilidade.
6. Registrar URLs de execução e logs, número de testes, falhas e correções; teste vermelho impede incorporação, assim como homologação real pendente quando a função for protegida.
7. Só após aprovação, integrar por PR e conferir a versão efetivamente publicada em desktop e PWA, com plano de reversão.

## Quadro de controle para cada item de implementação
Requisito GI-XX | descrição precisa | origem e conversa/data | arquivo(s) e URL(s) | dependência | fonte e dono | entrada/saída | validação automática | teste 390/768/1440 | teste negativo | versão do CI | evidência do publicado | estado | pendências.
Toda tarefa de uma fase deve produzir esses campos e não apenas um commit; atualizar o Caderno-mãe em cada rodada relevante.

## Ordem imediata após esta auditoria
1. Conservar separadas e revisar #26, #27 e #28. A #28 já possui duas baterias de CI verdes; falta inspeção visual comparativa e decisão de incorporar. A #26 depende também de homologação real Supabase.
2. Não iniciar funcionalidades novas até converter cada requisito em cartão rastreável, resolver conflitos entre planos e registrar padrões técnicos do motor de fontes.
3. Implementar macrofase A com foco em experiência responsiva e entrada de três perfis, e em seguida macrofase B (fontes e conteúdo básico) e C (motor de atualização); segurança e Gestão seguem trabalho paralelo isolado com bloqueios explícitos.
4. Em toda rodada maior, executar os testes internos sem solicitar ao usuário confirmação de cada commit, mas publicar apenas mudanças com resultados comprovados. A cada macrofase entregar relatório único com executado, testes, bloqueios e próxima ação.

## Pendências de auditoria de completude
- Confrontar cada conversa histórica integral, quando o texto completo estiver acessível, com a presente matriz. Não afirmar que todos os detalhes conversados desde a origem foram exaustivamente recuperados por lembrança ou somente pelos documentos existentes.
- Verificar lista de revistas e URLs individualmente em ambiente de teste, com fonte oficial, sem declarar todo link funcional por suposição.
- Verificar currículos Lattes, nomes, publicações e vínculos com consentimento e dados oficiais.
- Levantar fontes e regras reais para cada motor automático (não apenas a frequência desejada).
- Comparar visualmente imagens do antes e depois das versões mobile, tablet e desktop.
- Conferir que os planos anteriores e anexos técnicos permanecem íntegros após integrar esta auditoria.
