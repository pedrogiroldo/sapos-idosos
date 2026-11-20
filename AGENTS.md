# AGENTS.md

Instruções para qualquer agente de IA que trabalhe neste repositório (Claude Code, Codex, Cursor, OpenCode, Gemini CLI etc.).

## Fluxo de trabalho: Superpowers

Este projeto usa o [Superpowers](https://github.com/obra/superpowers), uma biblioteca de skills de fluxo de trabalho para agentes de IA.

- **Toda alteração grande** (nova feature, refatoração, mudança de arquitetura, correção de bug não trivial ou qualquer tarefa com vários passos) deve começar carregando a skill `using-superpowers` (no Claude Code: `superpowers:using-superpowers`) e seguir as skills que ela indicar (ex.: `brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging`).
- **Se o Superpowers não estiver disponível no seu agente**, não prossiga em silêncio. Avise o usuário que ele não foi encontrado, explique que é o fluxo de trabalho adotado por este projeto e indique as instruções de instalação para o agente em uso no [README do Superpowers](https://github.com/obra/superpowers#installation). No Claude Code, por exemplo:

  ```
  /plugin install superpowers@claude-plugins-official
  ```

  Só continue sem ele se o usuário confirmar explicitamente.
