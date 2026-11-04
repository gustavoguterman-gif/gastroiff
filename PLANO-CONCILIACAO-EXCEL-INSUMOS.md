# Controle administrativo de insumos: Excel como formato principal

## Finalidade
Comparar documentos de cada disciplina e fornecer ao(à) docente uma relação clara do material previsto, parcialmente confirmado, indisponível, pendente e efetivamente recebido. A decisão sobre alterações nas fichas técnicas permanece com o(a) docente.

## Quatro fontes distintas
1. Pedido do(a) docente. Relação original de insumos solicitados para uma disciplina/ciclo, possivelmente em várias abas, arquivos ou fichas técnicas.
2. Solicitação administrativa ao fornecedor. Permite identificar diferenças entre o pedido original e o encaminhamento.
3. Resposta formal do fornecedor. Confirma quantidades, faltas, substituições oferecidas, estimativa de entrega e a data/fonte da informação, quando expressamente documentadas.
4. Conferência de recebimento físico. Registra o que efetivamente chegou ao campus; a confirmação do fornecedor nunca equivale a recebimento.

## Entrada administrativa
- Prioridade para Excel: `.xlsx` e `.xls`, com reconhecimento de abas, cabeçalhos, tabelas e separadores. CSV pode ser alternativa.
- Não presumir que toda planilha tenha as mesmas colunas, uma única aba ou um arquivo por disciplina. Propor correspondência de colunas e pedir confirmação da administração.
- Identificar nome da disciplina, curso, ciclo, docente, data, laboratório, arquivo e origem de cada dado.
- Unidades precisam ser interpretadas com cuidado: kg e g só podem ser convertidos quando unidade e natureza do item permitirem. Não presumir equivalência entre caixa, pacote, unidade, litro ou quilograma.
- Conservar nomes originais, linhas, abas, versões e anexos para revisão. Apontar itens parecidos, duplicados, renomeados, substituições e ambiguidades.
- Prévia e validação humana antes de gravar qualquer informação, com histórico das correções.
- Até haver autenticação, permissões, armazenamento protegido e método de publicação controlado, tratar todo processamento de planilhas como simulação local com arquivos fictícios. `gestao.html` é pública e não deve publicar dados institucionais.

## Conciliação
Para cada item, comparar solicitado, efetivamente encaminhado, confirmado pelo fornecedor e recebido. Campos ausentes significam informação não fornecida, não quantidade zero. A origem da informação, data de atualização, responsável, situação e observações ficam registradas.
A conciliação deve localizar divergências quantitativas, produtos não encaminhados, pedidos sem resposta, confirmação parcial, falta informada, substituição oferecida, chegada parcial, excesso e mudanças posteriores. A confirmação integral de um pedido não prova que o material chegou.

## Visão docente
- Acesso ao planejamento da própria disciplina e ao detalhamento dos insumos, com data e fonte de cada atualização.
- Indicadores em linguagem simples, com tabela de solicitação, encaminhamento, resposta e recebimento.
- Prioridade para o que compromete preparações, permitindo associar insumos às fichas técnicas, consultar quantidades e destacar possíveis adaptações. Substituição automática de ingrediente não é autorizada.
- Quando houver alternativas, apresentar o máximo aproveitamento do conjunto de insumos confirmados e limites da sugestão, sem inventar disponibilidade.
- Apenas o(a) docente responsável e pessoas autorizadas poderão acessar informações detalhadas quando houver implantação compartilhada. Seleção do nome no formulário público não autentica a pessoa.

## Próximas entregas e critérios de aceite
1. Receber amostras reais com dados fictícios ou anonimizados dos três arquivos Excel de cada etapa e mapear nomes de abas e colunas.
2. Construir um leitor binário seguro, com limite de tamanho, rejeição de extensões inválidas e tratamento de planilhas malformadas; testar arquivos `.xlsx` e `.xls` reais. A existência do leitor CSV não prova esse requisito.
3. Implementar prévia administrativa com associação à disciplina, tratamento de divergências e confirmação explícita.
4. Implementar armazenamento protegido, papéis administrativos e docentes, trilha de alteração, versões e aprovação.
5. Testar comparação em celular e computador, alterações de quantidades, revisões de fornecedor e diferenças de unidade.
6. Vincular fichas técnicas à lista de insumos confirmados para apoiar adaptações e trocas de preparações.
7. Implantar somente após testes automatizados e funcionais aprovados, com autorização institucional e responsabilidades definidas.

## Situação do protótipo
A versão atual já inclui leitura local de arquivos `.xlsx` e `.xls`, reconhecimento inicial de abas e cabeçalhos, seleção de várias planilhas por etapa e prévia de comparação na Central de Gestão. Os testes binários de Excel, os testes em navegador e a validação geral passaram na proposta de implementação. Ainda faltam mapeamento manual de colunas ambíguas, confirmação formal da importação, armazenamento institucional protegido, autenticação por perfil, rastreabilidade persistente, associação às fichas técnicas e publicação controlada para cada docente. Não há sincronização automática com o Drive ou avisos reais.
