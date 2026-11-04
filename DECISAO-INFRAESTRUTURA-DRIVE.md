# Decisão de infraestrutura: Drive, Planilhas, Apps Script e banco protegido
Atualização: 04/11/2026. Estudo de implantação, não ativação.

## Objetivo
Reduzir trabalho do responsável pelo GASTROIFF, aproveitando o Drive já disponível para documentos, planejamento acadêmico e rotinas de atualização, mantendo o site público em GitHub Pages e preservando as responsabilidades institucionais.

## Princípio
O espaço disponível no Drive resolve armazenamento de arquivos, mas não resolve por si só autenticação, controle de acesso por perfil, processamento de envios, rastreabilidade, cotas de automação, aprovação de publicações ou custódia de dados institucionais.

## Comparação para decisão
| Necessidade | Drive e Planilhas com Apps Script | Supabase/Postgres com armazenamento privado |
| --- | --- | --- |
| Arquivos de referência e documentos públicos | Adequado, com permissões de compartilhamento revisadas | Possível, mas exige mais configuração |
| Controle de ciclos de disciplinas e insumos | Planilha de origem clara e fácil conferência | Dados estruturados com regras de acesso; edição exige interface |
| Avisos por data e resumo de pendências | Apps Script permite rotinas agendadas, sujeito a cotas e autenticação | Exige serviço de agendamento e correio transacional |
| Receber ocorrência com anexo privado | Possível mediante aplicativo web e controles adicionais; acesso deve ser testado | Preparação de tabelas e função iniciada, ainda sem implantação |
| Acesso restrito e diferenças de papéis | Permissões de Drive/Apps Script e identidade precisam de desenho cuidadoso | Autenticação e controle linha a linha preparados em migração, sem teste real |
| Questionários longitudinais e relatórios por coorte | Planilhas podem ser úteis para prototipagem, com cautela e governança | Mais adequado à modelagem relacional, auditoria e consultas complexas |
| Fonte única do site e publicação | Requer processo para exportação e publicação no GitHub | Requer serviço de publicação semelhante |
| Uso da conta pessoal | Simples para protótipo, mas cria risco de continuidade, custódia e permissões | Conta administradora também demanda política de continuidade |
| Custo | Depende de cotas e plano da conta; verificar antes de ativar | Depende de plano, volume, execução e armazenamento; verificar antes de ativar |

## Recomendação provisória
1. Manter GitHub Pages para conteúdos públicos e PWA.
2. Usar Google Drive para documentos de trabalho **não sigilosos** e cópias de segurança autorizadas, sem criar pastas públicas de respostas de estudantes.
3. Testar com Planilha Google uma base **fictícia** de ciclos de aulas práticas, insumos e responsáveis funcionais; a tela pública deve exibir apenas dados que podem ser divulgados.
4. Testar Apps Script com lembrete fictício de ciclo (ex.: 7 dias antes), incluindo tratamento de fuso horário, duplicidade, ausência de data, falha de envio, registro de resultado e cotas.
5. Reservar base protegida para cadastro de usuários, solicitações pessoais, anexos, pesquisas e egressos. Comparar o custo e a manutenção com a solução Google em teste controlado.
6. Escolher a solução final depois de testar escrita, leitura, acesso não autorizado, exportação, restauração e rotina de manutenção em ambiente isolado. A escolha precisa considerar custódia institucional.

## Modelo de dados futuro para um ciclo de disciplina
Identificador de ciclo; curso; período; disciplina; docente responsável vinculado à fonte; data de início; data de término; laboratório; data da conferência; lista de solicitações; status de cada item informado pelo setor; prazo previsto apenas se confirmado; data real de entrega; último aviso; resposta de conferência; fonte e histórico de alterações.

## Regra dos avisos
Quando faltarem 7 dias para o início, preparar lembrete ao docente responsável sobre materiais e equipamentos. Não enviar repetidamente se já houver confirmação do aviso. Não anunciar recebimento sem registro confirmado. Atividades urgentes devem ser tratadas pelo procedimento oficial, independentemente do sistema.

## O que funciona hoje
`planejamento-docente.html` permite selecionar um docente do cadastro público, registrar localmente disciplina e datas, ver os dias até início, consultar um checklist e exportar uma planilha CSV. Nenhum registro é enviado ao Drive, ao banco ou ao e-mail; não há acesso a compras reais. Esse módulo será a base de testes antes da integração institucional.

## Condições para produção
Confirmar autorização de custódia e responsabilidades; validar quem alimentará dados de compra; definir política de dados e backups; provisionar credenciais em serviço privado; configurar limites de uso; testar comportamento no Android/iOS e computadores; verificar prazos e fontes oficiais; documentar solução de falhas, reversão e manutenção.

## Teste realizado: planilha separada e importação local (04/11/2026)
- Foi criada no Drive conectado uma planilha nativa **GASTROIFF | TESTE | Ciclos e Insumos**, inteiramente demonstrativa, com as abas `Ciclos`, `Insumos` e `Instrucoes`. A leitura de retorno confirmou a estrutura e os valores de teste. O identificador privado dessa planilha **não foi adicionado ao código público**.
- A aba `Ciclos` inclui os campos: `id_ciclo`, `curso`, `disciplina`, `docente`, `inicio`, `fim`, `laboratorio`, `status_conferencia`, `data_conferencia`, `fonte`.
- A aba `Insumos` inclui: `id_item`, `id_ciclo`, `insumo_ou_material`, `quantidade`, `unidade`, `situacao`, `previsao_entrega`, `recebido_em`, `atualizado_em`, `fonte`.
- O cadastro público de ciclos pode receber **um arquivo CSV exportado manualmente da aba Ciclos**. Para isso, no Google Planilhas, selecionar somente a aba Ciclos e usar Arquivo → Fazer download → Valores separados por vírgulas (.csv). Não exportar a aba de insumos como ciclos.
- O GASTROIFF examina o cabeçalho, separa linhas, valida o nome docente contra o cadastro público, verifica curso e datas, detecta duplicação e rejeita linhas identificadas como fictícias. O usuário recebe uma prévia e confirma antes de adicionar ao dispositivo. Nenhuma alteração é enviada automaticamente à planilha original.
- A exportação é local, sem sincronização em tempo real nem confirmação de compras. Para dados institucionais reais, a aba `Insumos` precisará de responsabilidade formal pelo preenchimento, fonte, data de atualização, controle de acesso e regra de publicação de status.
- A etapa seguinte será um teste controlado de leitura das informações de insumos, sem atribuir a status “Não informado” a interpretação de entrega ou atraso. A automação de avisos por Apps Script será testada em modo simulação, sem enviar mensagens reais, antes de ativar gatilhos ou destinatários.
