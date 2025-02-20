# code-understanding-llm-platform

Esse repositório é para o projeto da disciplina de Tópicos avançados em engenharia de software. O foco deste projeto é a criação de uma plataforma para a utilização de LLMs para o auxílio do entendimento de código. A ideia é refazer, de forma um pouco mais simples, o experimento do artigo [Using an LLM to Help With Code Understanding](https://dl.acm.org/doi/10.1145/3597503.3639187), porém com uma abordagem diferente. Fazendo com que os participantes foquem muito mais no verdadeiro entendimento do código, do que em adicionar novas features.

Para o desenvolvimento da plaforma, esperamos que ela possa:
- Dar um resumo geral da base de código em contexto
- Explicar funções do código
- Explicar lógica de statements do código
- Explicar conteúdos extras, não diretamente relacionados ao código, mas em relação a bibliotecas e/ou métodos especicais utilizados

Para o experimento, esperamos realiza-lo da seguinte forma:
- Seleção de 5 a 10 desenvolvedores com nível de senioridade baixo/médio (Junior/Pleno)
- O experimento será realizado em duas etapas para cada voluntário:
  - Será dado para o voluntário, uma base de código relacionado a um contexto que não faz parte do contexto comum de trablho do mesmo. Com isso, ele deverá, utilizando a plataforma criada, responder algumas perguntas pre definidas sobre a base de código.
  - Posteriormente, será dado uma outra base de código, para o voluntário responder perguntas similares, porém, dessa vez, sem a assistencia da plafatorma, podendo apenas utilizar mecanismos de busca padrão da internet.
- Com os resultados obtidos, esperamos ter uma ideia final de como os modelos de linguagem podem ajudar no entendimento de código para desenvolvedores.
