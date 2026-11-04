# Fase 2 | Ativar a administração protegida

Situação em 04/11/2026: arquivos de preparação publicados no repositório, **nenhum banco configurado**. O portal público não recebe dados nesta estrutura.

## O que esta fase resolve
Preparar o registro privado de solicitações e ocorrências, fotos, encaminhamentos, conteúdos pendentes de aprovação, recomendações institucionais e alertas. O administrador do projeto continua vinculado ao professor, não ao cargo temporário de coordenador. Encaminhamentos oficiais permanecem sob responsabilidades institucionais.

## O que já existe
Arquivo `supabase/migrations/202611040001_gastroiff_base.sql`:
- sete tabelas com registro de responsáveis, solicitações, anexos privados, histórico de ações, fila de publicações, recomendações institucionais e notificações;
- regras de acesso restringindo a leitura a pessoas explicitamente cadastradas como administradoras; visitantes não possuem acesso direto às tabelas;
- gravação não liberada a visitantes, nem a administradores por chamadas diretas do navegador;
- local privado para anexos, sem leitura pública;
- campos para número de acompanhamento, curso, categoria, situação, prazo e histórico.

O arquivo é um modelo inicial, e não significa que o projeto esteja executando um banco de dados.

## Como ficará para quem usa
O estudante acessa Livro de Ocorrências, descreve a situação, escolhe uma foto e envia. O servidor valida os dados e guarda o registro com segurança; fornece número de acompanhamento. A coordenação recebe a demanda pertinente e o administrador do projeto pode acompanhar indicadores autorizados. A pessoa que enviou recebe resposta quando tiver optado por informar contato.

## Como ficará para o administrador
Uma única caixa de entrada deverá mostrar ocorrências, propostas, vagas, eventos e pesquisas, com ações sugeridas. As mensagens serão classificadas automaticamente, mas decisões e publicações precisarão de aprovação conforme regras específicas.

## Passos para ativar
1. Escolher quem terá a custódia dos dados e quais informações poderão ser coletadas, avaliando as exigências do IFF e as finalidades de pesquisa e extensão.
2. Criar um projeto em serviço de banco protegido. Supabase/Postgres é a base preparada, sujeito à aprovação dessa escolha e custos.
3. Configurar endereço do serviço, autenticação e usuário administrador. Essas informações não devem ser colocadas em arquivos públicos de configuração.
4. Executar a migração SQL no serviço escolhido, após revisão de segurança e testes de acesso.
5. Criar uma função de recebimento no servidor, que valide textos, consentimentos, tipos de arquivo e limites de tamanho. Essa função deverá controlar envios abusivos e disponibilizar o número de protocolo.
6. Integrar o Livro de Ocorrências e Participação ao serviço protegido; manter e-mail como alternativa durante a transição.
7. Configurar notificações a responsáveis e administrador de acordo com o tipo de demanda e com privacidade.
8. Testar envio de relato fictício, imagem fictícia, leitura por usuário não autorizado, acesso administrativo, histórico e exclusão/retificação.

## Testes obrigatórios de segurança
- Visitante anônimo não consegue ler qualquer registro, e-mail, arquivo ou mensagem de administração.
- Usuário autenticado que não seja administrador também não consegue ler.
- Identidade do administrador é confirmada no serviço de autenticação e pertence à lista restrita `gi_admins`, cadastrada somente por pessoal autorizado no serviço.
- A função de verificação não aceita um e-mail digitado como prova de identidade.
- Não há chaves de serviço, senhas nem tokens privados no repositório ou nos arquivos entregues ao navegador.
- Fotografias não são gravadas em pastas públicas e não têm links permanentes públicos.
- Submissões são verificadas, auditadas e limitadas para evitar mensagens automatizadas abusivas.
- O banco permite documentar as decisões sem publicar informações individuais.

## Próximo desenvolvimento de código
Implementar recebimento de solicitações por função no servidor, protegida contra abuso, com número de protocolo e upload privado; desenvolver a Central de Gestão autenticada. Antes de ativar, verificar autorização de uso e a política de privacidade. O modelo inicial deve ser testado com dados fictícios. Não usar respostas reais ou dados acadêmicos individuais para teste.

## Referências técnicas
Documentação Supabase de autenticação: https://supabase.com/docs/guides/auth
Controle de acesso a tabelas: https://supabase.com/docs/guides/database/postgres/row-level-security
Controle de acesso a arquivos: https://supabase.com/docs/guides/storage/security/access-control

## Incremento testável de 04/11/2026: recebimento seguro
- Criados `supabase/functions/receber-ocorrencia/validation.mjs` e `index.ts`, serviço de recebimento preparado **mas não implantado**.
- O serviço confere a origem do GASTROIFF, exige resposta válida do desafio antiabuso Cloudflare Turnstile (nome da ação: `gastroiff_ocorrencia`, domínio publicado), rejeita envios grandes e valida informações obrigatórias.
- Quando há foto, são aceitas apenas imagens JPG, PNG ou WebP de até 5 MB, com assinatura básica de arquivo conferida; o caminho de armazenamento é aleatório e o local é privado.
- O registro recebe número único gerado pelo banco, sem exposição de informação pessoal na resposta. Nome e e-mail são opcionais e somente podem ser armazenados com autorização explícita.
- Falhas durante etapas posteriores geram tentativa de desfazer escrita e retirar arquivo. Antes de uso real, serão necessários testes completos de compensação, auditoria de arquivos órfãos, limite de taxa por origem e monitoramento de abusos.
- A função não envia e-mails nem notifica a coordenação nesta versão. A implantação real exigirá armazenamento configurado, credenciais secretas, uma chave pública do desafio de validação no formulário e revisão de privacidade.
- A função não contém chaves ou endereços de destinatários. A gestão permanente do projeto permanece separada dos responsáveis institucionais.

## Verificações técnicas automatizadas
- Código de testes: `tests/receber-ocorrencia.test.mjs`.
- Execução programada para cada atualização do serviço: `.github/workflows/testar-ocorrencias.yml`.
- Testes realizados na rotina incluem campos obrigatórios, identidade facultativa e consentimento, modalidade do curso, vínculo do solicitante, datas, imagens inválidas ou grandes, origem e resposta antifraude.
- Uma primeira checagem de tipos detectou incompatibilidade no corpo enviado ao armazenamento e foi corrigida. A continuação da verificação de tipos é executada no workflow.
- Não se considera comprovada a segurança de produção apenas por testes unitários e checagem de tipos; faltam testes de integração com serviço real, armazenamento, permissão de usuários e privacidade.

## Preparação da ativação futura
1. Escolher hospedagem, custódia e responsabilidades legais dos dados dos estudantes.
2. Criar e proteger a infraestrutura Supabase e configurar autenticação.
3. Configurar o desafio Cloudflare Turnstile para o domínio do portal, com segredo apenas no servidor.
4. Executar e testar a migração em ambiente isolado, sem dados reais.
5. Implantar a função `receber-ocorrencia`, mantendo a verificação de JWT desabilitada **apenas para esta função pública** porque ela exige desafio antiabuso validado no servidor.
6. Conectar o formulário público com o desafio; pedir consentimento explícito para armazenar nome/e-mail e mostrar termos de privacidade.
7. Realizar teste integral com dados fictícios: relato, foto, protocolo, acesso negado para terceiros, consulta administrativa, exclusão e histórico.
8. Só então ativar envios reais. O formulário atual por e-mail continua sendo o canal disponível até lá.
