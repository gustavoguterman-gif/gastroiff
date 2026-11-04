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
