# GASTROIFF | Implantação da Gestão protegida e do painel docente

Estado em 04/11/2026: migração preparada e aprovada em PostgreSQL descartável, sem implantação em servidor institucional. Esta é uma instrução técnica e administrativa. A existência deste arquivo não significa que os usuários já possam acessar um painel privado.

## Responsabilidades e continuidade

A plataforma pública permanece no GitHub Pages. Os documentos institucionais, credenciais e registros por disciplina devem ficar em serviço privado sob governança autorizada. É necessário definir responsável pelo serviço, quem cria/desativa acessos, a custódia dos documentos, o procedimento de transição entre coordenações, cópias de segurança e restauração. A conta pessoal do responsável pelo projeto, isoladamente, não deve ser considerada a única garantia de continuidade.

## Modelo previsto e testado

O arquivo `supabase/migrations/20261104230000_praticas_privadas.sql` define cadastro confiável de papéis, ciclos, documentos, insumos, notificações previstas e histórico. A migração exige autenticação real de usuários; os papéis de Gestão e docente precisam ser atribuídos por administrador confiável, nunca pelo formulário público. Visitantes sem login não possuem acesso. Docentes autenticados consultam somente disciplinas vinculadas a sua identidade e já aprovadas, com quantidades estruturadas e aprovadas. A Gestão consulta e edita dados dos ciclos autorizados. O bucket de documentos originais é privado; docentes não têm acesso direto a planilhas de fornecedor, anexos brutos ou auditoria da Gestão.

As quantidades representam explicitamente solicitado, encaminhado, confirmado e recebido. Campo ausente significa ausência de informação, não falta garantida nem confirmação de fornecimento. Decisões sobre substituição de ingredientes e troca de fichas técnicas dependem do(a) docente responsável.

As operações são registradas por gatilhos do banco. O navegador não deve conseguir apagar registros do histórico. As notificações têm identidade única por ciclo e tipo de aviso para ajudar a evitar duplicidade.

## Testes obrigatórios antes do uso real

O workflow `testar-infraestrutura-praticas.yml` sobe PostgreSQL temporário e executa a migração sem dados reais, verificando que a Gestão insere registros, docentes veem apenas seus ciclos aprovados, um(a) docente não edita compras, pessoas sem vínculo não leem informações e documentos privados não ficam disponíveis ao(a) docente.

Antes da produção, repetir em ambiente isolado com Auth e Storage reais do provedor escolhido, incluindo: login e logout, recuperação e revogação de acessos, troca de docente responsável, negativa de acesso a outro ciclo, tentativa de acessar URLs de documentos sem autorização, upload de XLSX/PDF/imagens com limite, leituras de OCR marcadas para revisão, confirmação de versões, aprovação por gestor, acesso ao quadro do(a) docente, backup/restauração, registro dos eventos e tratamento de erro de rede. O teste SQL isolado comprova as regras no banco de homologação, mas não substitui esses testes integrados.

## Sequência de ativação

Primeiro, selecionar e conectar a infraestrutura autorizada. A opção Supabase é um exemplo em desenvolvimento e deve ser comparada com a alternativa Google Drive/Planilhas/Apps Script já estudada em `DECISAO-INFRAESTRUTURA-DRIVE.md`. Somente após a escolha executar a migração no projeto correto, testar autorização, configurar bucket privado e provisionar papéis.

Em seguida, conectar a Gestão à API autenticada, migrar apenas dados de teste e validar envio de arquivos, histórico, associação por ciclo, correção de campos, revisão de insumos e aprovação. O painel docente público somente poderá passar a consultar a base protegida após autenticação real e verificação da autorização do(a) docente. Nunca publicar JSON com dados individuais no GitHub Pages para depois esconder a informação por interface.

Por fim, ativar avisos de sete dias com remetente autorizado, destino do(a) docente verificado, aprovação e acompanhamento da entrega, idempotência e registro de falhas. Nenhuma mensagem deve prometer recebimento físico quando só existe confirmação do fornecedor. Antes dessas verificações, manter a prévia local e nenhuma mensagem automática.

## Desktop e aplicativo mobile

Cada etapa deve ser revisada visual e funcionalmente no navegador de computador e no aplicativo/PWA no celular, além de tablet quando necessário. Validar telas de entrada, seleção de arquivos, prévia de planilhas e PDFs, perguntas sobre lacunas, revisão de quantidades, avisos, acesso exclusivo do docente e navegação do PWA. Os testes automatizados bloqueantes verificam 390, 768 e 1440 pixels, manifesto, ícones, cache offline e navegação; a implantação real ainda exigirá teste manual de instalação Android e iOS e verificação de layout nos dispositivos.
