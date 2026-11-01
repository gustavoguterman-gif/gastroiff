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