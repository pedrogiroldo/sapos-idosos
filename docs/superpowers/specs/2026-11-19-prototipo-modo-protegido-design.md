# Protótipo do modo protegido (app Expo + API NestJS) — design

*19/11/2026 · Hack Brasil 2026 · entrega final 30/11*

## Intenção

O app família anti-golpe é instalado pelo filho ou neto no celular do idoso. Ele junta, num app só, um launcher simplificado, a identificação de ligações suspeitas e o verificador "Isso é golpe?". Este protótipo é a **primeira rodada de código de verdade**: o celular do idoso funcionando num Android real, com a API que o sustenta.

**Por quê agora:** o plano do hackathon põe a peça mais arriscada primeiro. A triagem de ligações (`CallScreeningService`) precisa barrar ou avisar uma ligação num Android real **até 22/11**. Se não funcionar, o fluxo de ligação vira slide. O resto da demo (launcher, verificador) precisa estar de pé para mostrar à banca.

**Sucesso:** num Android 10+ físico, com o app como tela inicial e papel de triagem concedido:
1. A tela inicial do idoso aparece no lugar do launcher do fabricante, e os atalhos abrem os apps de verdade (discador, WhatsApp, câmera).
2. Uma ligação de um número da base sintética faz aparecer a tela de alerta "Cuidado!" por cima de tudo.
3. O idoso cola uma mensagem em "Isso é golpe?" e recebe um veredito: determinístico na hora para sinais fortes, ou do modelo de IA via API para os casos em dúvida.

## Contexto (fontes já decididas)

- Estudo técnico: https://claude.ai/artifact/7bTqr7zKyVUDd5pE7i72YZ
- Design system v2.1 (tokens, componentes, `expo/theme.ts`): https://claude.ai/artifact/BSJZB7uPfRZRAd9Dg1eLrE
- Mockup realista (canvas, 10 telas na v2): https://claude.ai/artifact/CE23UnStjoSECBe22w2T21 — as 5 telas do idoso são a referência visual deste protótipo: `Main` (tela inicial), `IdosoLigacao` (ligação de golpista), `IdosoCola` (Isso é golpe?), `IdosoVeredito`, `IdosoAjuda` (pedir ajuda).

## Objetivos

- Monorepo com app Expo (modo protegido, Android) e API NestJS.
- Módulo local Kotlin com `CallScreeningService`, Activity `HOME` e pedido do papel `ROLE_CALL_SCREENING`.
- Base sintética de números denunciados servida pela API, baixada pelo app e guardada no aparelho num lugar que o Kotlin lê direto.
- Verificador "Isso é golpe?": regras determinísticas + máscara LGPD no aparelho; modelo de IA via API (Mastra) para os casos em dúvida.
- As 5 telas do idoso implementadas com os tokens do design system v2.1 (modo protegido: texto ≥17px, frases 20px, alvos 64px, sem transparência, mola sem quique).

## Fora do escopo (não-objetivos)

- **Tudo do responsável/familiar:** modo família, pareamento, painel, alertas push, edição remota da tela inicial, FCM. As telas `Familia*` do canvas não entram.
- iPhone (Call Directory, modo leve).
- Sinal da Origem Verificada (STIR/SHAKEN).
- Base real de números, denúncias colaborativas, contestação.
- Receber texto/imagem pelo menu Compartilhar do Android (`ACTION_SEND`) e OCR de print. O verificador recebe só texto colado nesta rodada.
- Publicação na Play Store. APK instalado direto basta.

## Antiobjetivos (falha mesmo funcionando)

- O idoso ver jargão ("phishing", "spam", "fraude") ou culpa ("você errou").
- Dizer "É seguro". O máximo é "Parece seguro".
- A ligação ficar travada esperando internet: a triagem nunca chama a rede.
- Texto da mensagem sair do aparelho com CPF, telefone ou cartão visíveis.
- Chave do provedor de IA dentro do APK.
- Bloquear sem saída: "Atender mesmo assim" sempre existe.

## Restrições

- Prazo: triagem num aparelho real até 22/11; demo até 30/11.
- Android 10+ (API 29) é o mínimo do modo protegido.
- Expo Go não serve: build de desenvolvimento (`expo-dev-client`) + `npx expo prebuild`.
- `onScreenCall()` tem pouco tempo de resposta: a consulta usa só dados locais, lidos em Kotlin, sem acordar o JavaScript.
- Edital (REG 6.9): só dados sintéticos. Números, nomes e domínios da base são inventados.
- Time conhece TypeScript; Kotlin mínimo.
- Fabricantes (Xiaomi, Samsung) matam serviços em segundo plano: testar em duas marcas.

## Abordagens consideradas

| | Como | Troca |
|---|---|---|
| **A. Monorepo pnpm com pacote compartilhado (escolhida)** | `apps/mobile`, `apps/api`, `packages/regras` | Regras e máscara escritas uma vez, rodando no celular (offline) e na API. Custo: configurar Metro para o workspace. |
| B. Monorepo sem pacote compartilhado | Regras duplicadas em app e API | Mais simples de montar; regras divergem. |
| C. Dois repositórios | — | Atrito demais para 4 pessoas em 11 dias. |

O Pedro escolheu **A**. Antes disso, escolheu fazer **Expo de verdade** (e não um protótipo clicável) e, desta rodada, **só o celular do idoso** com a API (e não os dois celulares conversando nem só o esqueleto nativo).

## Decisões do Pedro

- Expo (TypeScript) com módulo local em Kotlin; foco Android.
- Primeira rodada = celular do idoso; nada do responsável.
- Verificador = **verificação determinística antes** + **modelo de IA com prompt**.
- API própria em **NestJS**, com **Better Auth**, **Mastra.ai** e **Prisma ORM**.
- Monorepo com pacote compartilhado (abordagem A).

## Desenho

### Estrutura

```
apps/
  mobile/                      Expo (expo-router), modo protegido
    modules/protecao-android/  módulo local Kotlin (Expo Modules API) + config plugin
  api/                         NestJS + Prisma + Better Auth + Mastra
packages/
  regras/                      TS puro: regras determinísticas, máscara LGPD, tipos e schemas compartilhados
docker-compose.yml             Postgres
```

Gerenciador: pnpm workspaces.

### `packages/regras`

TypeScript puro, sem dependência de Node nem de React Native, usado pelos dois apps.

- `mascarar(texto)`: troca CPF, telefone, cartão (e e-mail) por `***`. Roda **no celular**, antes de qualquer envio.
- `verificarDeterministico(texto)`: devolve `{ veredito: 'golpe' | 'duvida', sinais: Sinal[], tipo?: TipoGolpe }`. Sinais fortes (domínio da lista sintética de golpe, link encurtado + pedido de Pix, "código de verificação" + pedido de envio, "troquei de número" + pedido de dinheiro, quem diz ser banco/INSS + link) → `golpe`. Qualquer outro caso → `duvida`. **Nunca devolve "seguro"**: só o modelo pode dizer "parece seguro".
- Tipos compartilhados: `Veredito = 'golpe' | 'parece_seguro' | 'sem_certeza'`, `TipoGolpe` (falso banco, falso parente, falso INSS, Pix urgente, código de verificação, link falso, outro), `ResultadoVerificacao`, `NumeroDenunciado`.
- Schemas com zod, usados para validar a resposta da API no app e a saída do agente na API.

### `apps/api` (NestJS)

- **Prisma + Postgres.** Modelos mínimos: tabelas do Better Auth; `NumeroDenunciado` (número E.164, tipo de golpe, contagem, versão); `BaseVersao`; `Verificacao` (texto **já mascarado**, veredito, tipo, origem `regras|ia`, sessão, data) para depurar o prompt na demo. Seed com a base sintética (~50 números, nomes inventados) e a lista de domínios.
- **Better Auth com o plugin `anonymous`.** No primeiro uso, o app cria uma sessão anônima e guarda o token com segurança no aparelho. Todas as rotas exigem sessão. O pareamento futuro com o responsável se liga a essa conta.
- **Mastra:** um agente `verificador` com prompt em português que segue a voz do design system (frases curtas, "você", sem jargão, nunca "é seguro") e saída estruturada `{ veredito, tipo, frase, motivos[] }`. Provedor: Anthropic, modelo `claude-haiku-5-5`, com a chave em variável de ambiente da API.
- **Rotas:**
  - `POST /verificacoes` `{ texto }` (já mascarado) → roda `verificarDeterministico` de novo; se der `golpe`, responde sem chamar o modelo; se der `duvida`, chama o agente. Mascara de novo por garantia antes de chamar o modelo e de gravar.
  - `GET /numeros-denunciados?desde=<versao>` → `{ versao, numeros[] }` (a lista inteira se `desde` estiver vazio).
  - Rotas do Better Auth montadas no Nest.
- Limite simples de taxa por sessão em `/verificacoes` (proteger a chave na demo).

### `apps/mobile` (Expo, modo protegido)

- **Telas** (expo-router), seguindo os 5 artboards do idoso no canvas:
  - `/inicio`: relógio, selo "Protegida", tiles grandes (Ligar, WhatsApp, Câmera, Fotos), contatos favoritos com foto, "Isso é golpe?", "Pedir ajuda à família".
  - `/golpe`: colar mensagem → `/veredito`.
  - `/ajuda`: folha (Sheet) com ligar/WhatsApp para os contatos de ajuda.
  - `/alerta-ligacao`: tela "Cuidado!" (CallAlert) em `danger-deep`, com "Não atender" primeiro e maior e "Atender mesmo assim".
- **Configuração local fixa:** atalhos e contatos de demonstração num arquivo do app (o responsável vai editar isso numa próxima rodada). Os contatos de "Pedir ajuda" também são fixos.
- **Fluxo do verificador:** `mascarar` → `verificarDeterministico` → se `golpe`, veredito na hora; senão, `POST /verificacoes`; sem internet ou com erro, "Não deu para ter certeza" + "Pergunte para a família".
- **Sincronização da base:** ao abrir o app (e a cada N horas enquanto aberto), `GET /numeros-denunciados?desde=` e grava no armazenamento local lido pelo Kotlin.
- **Primeira execução:** sequência de telas grandes que pede, uma por vez, (1) virar tela inicial padrão, (2) o papel de identificação de chamadas, (3) notificações, (4) permissão para encerrar chamadas. Cada uma explica em uma frase por que precisa.
- **Painel de demo escondido** (decisão de Claude): aberto por toque longo no relógio. Troca a regra entre "avisar" e "bloquear", força a sincronização da base e mostra a versão da base e o estado das permissões. Só para a banca e para testes.
- Tema claro e escuro via `useColorScheme()`; tokens de `expo/theme.ts` do design system copiados para o app; fonte do sistema (sem `fontFamily`); `expo-haptics` só no alarme e no veredito.

### `modules/protecao-android` (Kotlin)

- **`CallScreeningService`:** em `onScreenCall`, para chamadas recebidas, normaliza o número e consulta o armazenamento local. Se estiver na base: responde **permitindo a chamada, mas silenciada** (`setSilenceCall(true)`, padrão "avisar") e dispara uma notificação de alta prioridade com *full-screen intent* que abre `/alerta-ligacao` por cima da tela de chamada do sistema, com número e tipo de golpe. Se não estiver: permite sem fazer nada. A regra "avisar" ou "bloquear" fica num valor local (padrão "avisar"); bloquear = `setDisallowCall` + `setRejectCall` + `setSkipNotification`.
- **Botões do alerta (decisão do Pedro):** "Não atender" tenta encerrar a chamada com `TelecomManager.endCall()` (permissão `ANSWER_PHONE_CALLS`, pedida na primeira execução); se o aparelho recusar, só fecha o alerta e a chamada segue silenciosa até cair. "Atender mesmo assim" fecha o alerta e deixa a tela de chamada do sistema à vista. Virar discador padrão (`InCallService`) fica fora.
- **Activity `HOME`:** `intent-filter` com `MAIN` + `HOME` + `DEFAULT` abrindo o app React Native na rota `/inicio`; o botão voltar na tela inicial não sai do app.
- **API para o JS:** `pedirPapelTriagem()`, `temPapelTriagem()`, `ehTelaInicialPadrao()`, `abrirEscolhaTelaInicial()`, `gravarBase(numeros, versao)`, `definirRegra('avisar'|'bloquear')`, além de um evento ou deep link que leva ao alerta.
- **Config plugin** que escreve no `AndroidManifest.xml` o serviço (com `BIND_SCREENING_SERVICE`), o filtro `HOME` e as permissões (`USE_FULL_SCREEN_INTENT`, `POST_NOTIFICATIONS`).

## Ordem e execução (decisões)

- **Quem constrói:** Claude, nesta sessão, tarefa por tarefa (decisão do Pedro).
- **Primeiro passo:** exportar do design system e do canvas para o repositório (`docs/design/`) o `expo/theme.ts`, os tokens e as 5 telas do idoso, para o trabalho não depender dos links (decisão de Claude).
- **Marco de 22/11 primeiro** (decisão de Claude): monorepo mínimo → app Expo com build de desenvolvimento → módulo Kotlin com triagem lendo uma **lista fixa embutida** + tela de alerta + Activity `HOME`, testado num aparelho real. Só depois: `packages/regras`, API (Prisma, Better Auth, Mastra), sincronização da base, demais telas.
- **Número real da demo** (decisão de Claude): o seed versionado só tem números inventados (REG 6.9). O número do celular que vai ligar na demo entra por um arquivo `apps/api/prisma/seed.demo.json`, fora do git (`.gitignore`), lido pelo seed se existir.

## Deixado para quem constrói

- Onde a base fica no aparelho (SQLite próprio, Room ou SharedPreferences/arquivo), desde que o Kotlin leia sem passar pelo JS e a escrita pelo JS seja atômica.
- Normalização de números (E.164 com DDI 55).
- Detalhes do prompt, das regras e das expressões de máscara; os casos de teste vêm dos exemplos do mockup.
- Versões exatas das bibliotecas (consultar a documentação atual: Expo SDK, Better Auth, Mastra, Prisma, NestJS).
- Como integrar o Better Auth no Nest (adaptador da comunidade ou montagem manual do handler).
- Como o app acha a API na demo (URL por variável de ambiente; túnel ou IP da rede local).
- Testes: TDD em `packages/regras` e nas rotas da API; o módulo Kotlin é verificado à mão no aparelho, com um roteiro escrito.
