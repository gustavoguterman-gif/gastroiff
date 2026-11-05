# Auditoria das notificações de falha recebidas em 04/11/2026

Escopo: dez e-mails encontrados no Gmail enviados pelo GitHub sobre o repositório `gustavoguterman-gif/gastroiff`. Cada mensagem foi associada à execução específica e ao passo que falhou. Essas falhas históricas continuam com o estado “failed” no GitHub, mesmo depois de uma correção posterior. O critério de resolução é a aprovação de uma revisão posterior que preserve o teste e corrija o comportamento, não apagar mensagens nem alterar registros de execução.

| E-mail / execução | Commit indicado | Passo que falhou | Diagnóstico a partir do log | Resolução e verificação |
| --- | --- | --- | --- | --- |
| 41863728515 | `54a2605` | Testar motor sem rede | Dois testes antigos esperavam exceção quando não havia vagas; o motor passara a permitir resultado válido vazio | Testes atualizados, revisão posterior no ramo principal; validação completa 41945381579 aprovada |
| 41871679253 | `1457940` | Testar atualização em navegador | Botão consultado antes de concluir a primeira requisição; contagem esperada 2, observada 1 | Espera explícita da resposta real antes da nova consulta; validação 41945381579 aprovada |
| 41871679289 | `1457940` | Validação completa, monitor no navegador | Mesmo descompasso do teste de recarga | Correção integrada; validação 41945381579 aprovada |
| 41871876938 | `ba86763` | Testar atualização em navegador | Ainda esperava duas consultas sem esperar a segunda resposta | Correção do teste assíncrono no commit principal `35db89a6`; validação 41945381579 aprovada |
| 41871876851 | `ba86763` | Validação completa, monitor no navegador | Mesmo erro de sincronização | Correção integrada; validação 41945381579 aprovada |
| 41872107249 | `36fd557` | Testar atualização em navegador | Uma chamada observada, quando o teste exigia duas | Correção de sincronização e interceptação de service worker em `35db89a6`; validação 41945381579 aprovada |
| 41872107287 | `36fd557` | Validação completa, monitor no navegador | Mesmo erro na recarga da fonte publicada | Validação 41945381579 aprovada |
| 41872276821 | `3c64d54` | Consultar fontes públicas reais | Fonte externa devolveu HTML sem a estrutura de vagas esperada, e o programa lançou `ValueError` | Tratamento de tentativas controladas e separação dos testes determinísticos da disponibilidade externa no commit `35db89a6`. Os testes integrados posteriores foram aprovados; a fonte externa continua sujeita a alterações |
| 41894971897 | `13b5d19` | Testar validações e leitura de documentos | Um PDF digitalizado sem texto não causava a rejeição esperada | Correção de leitura do PDF no commit integrado `85de3d75`; testes específicos 41895233335 e nova validação integrada 41945381579 aprovados |
| 41894971489 | `13b5d19` | Testes estáticos e unitários da validação completa | Mesmo falso positivo de leitura de PDF sem texto | Correção integrada `85de3d75`; nova validação completa 41945381579 aprovada |

## Regra de auditoria daqui em diante

A aprovação das execuções posteriores demonstra que as regressões acima deixaram de ocorrer na revisão testada. Ela não garante funcionamento futuro das fontes externas nem substitui o teste de interface no navegador publicado.

Todos os commits novos devem passar pela validação geral com auditoria **bloqueante** em 390 px, 768 px e 1440 px, conferência da PWA (ícones, manifesto, instalação técnica, cache e offline) e verificações específicas dos módulos alterados. As imagens de evidência e o resumo JSON devem ficar nos artefatos do GitHub Actions.

As permissões privadas da Gestão e dos docentes também precisam passar em um banco PostgreSQL real e descartável, com usuário gestor, docente da disciplina, outro docente e visitante anônimo. Testes de código ou SQL em um repositório público não autorizam afirmar que já existe banco institucional configurado.

A migração `supabase/migrations/20261104230000_praticas_privadas.sql` permanece **não implantada**, até haver projeto Supabase institucional ou serviço autorizado, aprovisionamento de identidades, política de custódia e verificação em ambiente isolado.
