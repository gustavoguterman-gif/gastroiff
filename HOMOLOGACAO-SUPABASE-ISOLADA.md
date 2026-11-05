# Homologação de leitura Supabase: execução manual e isolada

Este roteiro é para um projeto Supabase **separado e descartável**, com contas fictícias criadas previamente por uma pessoa autorizada. Não há implantação conectada ao site público. O script `tests/homologacao-supabase-leitura.cjs` utiliza somente GET, login e logout. Não instala migrações, não cria ou exclui usuários, nem envia arquivos. Ele falha se a configuração pública estiver ativada.

Condições iniciais: um projeto exclusivo de homologação autorizado, migrações privadas aplicadas e verificadas por quem administra o ambiente, três contas fictícias com roles `gestao`, `docente` e `docente` atribuídas por operador autorizado, ao menos um ciclo aprovado para cada docente e um arquivo completamente fictício em `gastroiff-praticas-privado` vinculado a registro documental. Não usar nomes, matrículas, SIAPE, arquivos ou senhas institucionais verdadeiros.

Variáveis de ambiente obrigatórias, definidas apenas na sessão privada do executor e nunca no GitHub ou no navegador:

```text
GASTROIFF_STAGING_CONFIRM=SIM_AMBIENTE_DESCARTAVEL
GASTROIFF_STAGING_PROJECT_REF=<referência de 20 caracteres do projeto descartável>
GASTROIFF_STAGING_URL=https://<referência>.supabase.co/
GASTROIFF_STAGING_ANON_KEY=<chave pública do projeto descartável>
GASTROIFF_MANAGER_EMAIL=<conta fictícia da Gestão>
GASTROIFF_MANAGER_PASSWORD=<senha fictícia>
GASTROIFF_TEACHER_A_EMAIL=<conta fictícia docente A>
GASTROIFF_TEACHER_A_PASSWORD=<senha fictícia>
GASTROIFF_TEACHER_B_EMAIL=<conta fictícia docente B>
GASTROIFF_TEACHER_B_PASSWORD=<senha fictícia>
```

A partir da raiz de uma cópia local do repositório, o operador executa `node --test tests/homologacao-supabase-leitura.test.cjs` para conferir bloqueios locais sem rede; em seguida, se o ambiente descartável estiver provisionado, `node tests/homologacao-supabase-leitura.cjs`. Não executar comandos com senhas literalmente no histórico do terminal.

O script tenta consultar todas as seis tabelas privadas sem sessão, autentica as três contas, verifica os papéis, impede que docentes vejam ciclos de colegas, rascunhos, documentos e auditoria; recupera o conteúdo binário de um documento fictício pela Gestão e compara seu SHA-256 com o registro do banco; rejeita o download do mesmo arquivo por visitante e pelos dois docentes; por fim, encerra as três sessões, inclusive diante de erro. Depois de logout bem-sucedido, tenta renovar cada sessão usando seu refresh token anterior. A homologação falha se essa renovação funcionar ou se o servidor de autenticação responder de modo inconclusivo. Uma divergência de bytes impede a homologação. Apenas tamanho do documento e contagens são incluídos no resultado, sem conteúdos, credenciais ou dados reais. O teste verifica o encerramento pela API de autenticação, mas **não promete revogação imediata de JWT de acesso já emitido**. Para isso, a próxima etapa exige ensaio separado de expiração, refresh token revogado e reconexão no aplicativo.

Mesmo após esse ensaio, ainda será necessário testar o ciclo completo de upload, persistência, download e restauração de backup no serviço real de homologação. Esses procedimentos exigem um ambiente explicitamente autorizado e descartável, e não foram executados por este roteiro.

Critério de aceitação: todos os testes devem terminar sem falhas, com registros de execução sem dados sensíveis, inspeção de celular e desktop, e aprovação das responsabilidades de custódia antes de habilitar qualquer integração real. Não inserir secrets nem credenciais nos resultados, commits, comentários ou capturas.


Revisão de 05/11/2026: testes sem rede passaram a simular arquivo original íntegro, arquivo alterado, vazamento de arquivo a visitante/docente e caminho de armazenamento manipulado. Esses testes se executam em CI com dados fictícios, não comprovam segurança do serviço Supabase real nem dispensam homologação autorizada com Auth, Storage, RLS, tokens e backup.


## Ensaio de encerramento e renovação de sessão (05/11/2026)

O logout é validado pela revogação dos três refresh tokens em contas fictícias. O provedor pode manter o access token (JWT) anterior válido até a expiração, mesmo após o logout. Por isso, o teste não afirma revogação imediata do JWT. Em caso de falha de logout, o roteiro não tenta renovar sessões que possam continuar válidas. Tokens, senhas e corpos de resposta nunca entram no relatório.

Exigir respostas HTTP 400, 401 ou 403 da tentativa de renovação após a saída. Respostas HTTP 200, 429, 500 ou falhas de conexão tornam o resultado não homologado, pois não comprovam revogação. A checagem somente deve ser feita em projeto descartável autorizado. Para requisitos de revogação imediata de acesso a dados sensíveis, é necessário estudar validação adicional de sessões ativas e política de expiração adequada, com execução real em ambiente isolado.

Fontes técnicas: https://supabase.com/docs/guides/auth/signout e https://supabase.com/docs/guides/auth/sessions e https://supabase.github.io/auth/
