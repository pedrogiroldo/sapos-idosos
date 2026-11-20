# Plano 1 — Marco de 22/11: triagem de ligações e tela inicial no Android real

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um APK de desenvolvimento que, num Android 10+ real, vira a tela inicial, reconhece uma ligação de um número da base local e mostra o alerta "Cuidado!" por cima da chamada silenciada.

**Architecture:** Monorepo pnpm com `apps/mobile` (Expo SDK 58, expo-router, dev client). Um módulo local Expo em Kotlin (`apps/mobile/modules/protecao-android`) traz o `CallScreeningService`, a lógica de decisão pura (testada em JVM), o armazenamento da base em SharedPreferences e as funções expostas ao JS. Um config plugin escreve o manifesto. A base, nesta rodada, é uma lista fixa embutida mais números de teste adicionados pelo painel de demo; a API vem no Plano 2.

**Tech Stack:** pnpm 10 workspaces, Expo SDK 58 (`create-expo-app --template default@sdk-58`), expo-router, expo-dev-client, Expo Modules API (Kotlin), JUnit 4, jest-expo + @testing-library/react-native, JDK 17 (`~/.sdkman/candidates/java/17.0.13-tem`), Android SDK 35/36.

**Spec:** `docs/superpowers/specs/2026-11-19-prototipo-modo-protegido-design.md`

**Planos seguintes:** Plano 2 — `packages/regras` + API NestJS (Prisma, Better Auth, Mastra). Plano 3 — telas completas do idoso, verificador e sincronização da base.

## Global Constraints

- Android mínimo: API 29 (Android 10). `minSdkVersion 29` no app.
- Expo Go não serve: sempre build de desenvolvimento (`expo-dev-client`, `expo prebuild`, `expo run:android`).
- `onScreenCall()` só lê dados locais em Kotlin; nada de rede nem de JS durante a ligação.
- Só dados sintéticos versionados (REG 6.9). Números reais só entram em tempo de execução pelo painel de demo.
- Copy do idoso: frases curtas, "você", sem jargão ("phishing", "spam", "fraude"), nunca "É seguro". Título do alarme: "Cuidado!". Botões: "Não atender" (primeiro e maior), "Atender mesmo assim".
- Modo protegido: texto ≥17px, frases 20px, alvos de toque 64px, sem transparência, mola sem quique, cores de `theme.ts` do design system v2.1 (alerta em `danger-deep` com `alarm-card`).
- Fonte do sistema: não definir `fontFamily`.
- Pacote Android: `com.saposidosos.app`; scheme de deep link: `saposidosos`.
- Tipos de golpe (strings exatas): `falso_banco`, `falso_parente`, `falso_inss`, `pix_urgente`, `codigo_verificacao`, `link_falso`, `outro`.
- Gradle roda com JDK 17: `export JAVA_HOME=~/.sdkman/candidates/java/17.0.13-tem`.
- Antes de usar uma API de biblioteca, consultar a documentação atual pelo Context7 (Expo SDK 58).

## Review Focus

1. **Número que chega em formatos variados** (`+5511987654321`, `11987654321`, `011987654321`, `01511987654321` com código de operadora, número oculto/`null`) → reconhece os iguais e nunca quebra; número oculto é permitido. Teste: `NumeroTest` (Task 3).
2. **Notificações negadas** → se o app não pode mostrar o alerta, ele **não silencia** a ligação (senão o idoso perde a chamada sem aviso). Teste: `DecisaoTest.semPermissaoDeAvisarNaoSilencia` (Task 3).
3. **Base vazia ou corrompida** (SharedPreferences sem chave ou JSON inválido) → cai na lista embutida, permite chamadas fora dela, não quebra. Teste: `BaseLocalTest.jsonInvalidoUsaEmbutida` (Task 3).
4. **"Não atender" recusado pelo aparelho** (`endCall()` devolve `false` ou lança) → o alerta fecha mesmo assim. Teste: `alerta-ligacao.test.tsx` "fecha quando encerrar falha" (Task 5).
5. **Botão voltar na tela inicial** → não sai do app nem mostra tela vazia. Teste: `inicio.test.tsx` "voltar não sai" (Task 6).

---

### Task 1: Monorepo e design no repositório

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore` (substitui o atual), `.nvmrc`
- Create: `docs/design/theme.ts`, `docs/design/README.md`, `docs/design/telas/{Main,IdosoLigacao,IdosoCola,IdosoVeredito,IdosoAjuda}.dc.html`

**Interfaces:**
- Produces: workspaces `apps/*` e `packages/*`; `docs/design/theme.ts` (cópia exata do `expo/theme.ts` do design system) que a Task 2 copia para o app.

- [ ] **Step 1:** Raiz: `package.json` privado (`"name": "sapos-idosos"`, `"packageManager": "pnpm@10.32.1"`, scripts `"mobile": "pnpm --filter mobile"`, `"test": "pnpm -r test"`); `pnpm-workspace.yaml` com `packages: ['apps/*', 'packages/*']`; `.npmrc` com `node-linker=hoisted`; `.nvmrc` = `22`; `.gitignore` com `node_modules/`, `.expo/`, `apps/mobile/android/`, `apps/mobile/ios/`, `*.apk`, `.env*`, `apps/api/prisma/seed.demo.json`.
- [ ] **Step 2:** Exportar do design system (`https://claude.ai/artifact/BSJZB7uPfRZRAd9Dg1eLrE`, Artifact `list` com `scope: "files"`, depois `read` com `path`) o `expo/theme.ts` para `docs/design/theme.ts`, e o `project/README.md` para `docs/design/README.md`. Exportar do canvas (`https://claude.ai/artifact/CE23UnStjoSECBe22w2T21`) os 5 artboards do idoso para `docs/design/telas/`.
- [ ] **Step 3:** Verificar: `pnpm install` termina sem erro; `ls docs/design/telas | wc -l` → `5`; `grep -c "danger" docs/design/theme.ts` → maior que 0.
- [ ] **Step 4: Commit** — `chore: monorepo pnpm e design exportado para docs/design`

### Task 2: App Expo com build de desenvolvimento

**Files:**
- Create: `apps/mobile/` (template `default@sdk-58`, depois enxugado), `apps/mobile/app.json`, `apps/mobile/src/theme.ts`, `apps/mobile/app/_layout.tsx`, `apps/mobile/app/inicio.tsx` (placeholder), `apps/mobile/app/index.tsx` (redireciona para `/inicio`), `apps/mobile/jest.config.js`
- Test: `apps/mobile/__tests__/smoke.test.tsx`

**Interfaces:**
- Produces: `theme` em `apps/mobile/src/theme.ts` (exporta `colors.light`, `colors.dark`, `space`, `radius`, `size`, `type`, `spring`, `press`); hook `useTema(): typeof colors.light` em `apps/mobile/src/useTema.ts` (escolhe pelo `useColorScheme()`).

- [ ] **Step 1:** `pnpm create expo-app --template default@sdk-58 apps/mobile`; remover telas e componentes de exemplo do template. `app.json`: `name` "App família", `slug` "app-familia", `scheme` "saposidosos", `android.package` "com.saposidosos.app", `orientation` "portrait", plugin `expo-build-properties` com `android.minSdkVersion: 29`. Instalar `expo-dev-client`, `expo-build-properties`, `jest-expo`, `@testing-library/react-native`.
- [ ] **Step 2:** Copiar `docs/design/theme.ts` para `apps/mobile/src/theme.ts` sem mudar valores; criar `useTema`.
- [ ] **Step 3: Teste que falha** — `smoke.test.tsx`: renderiza `app/inicio.tsx` e espera `getByText('Isso é golpe?')`.
- [ ] **Step 4:** `pnpm mobile test` → FAIL (texto não existe).
- [ ] **Step 5:** `inicio.tsx` placeholder com o botão "Isso é golpe?" usando `useTema()` (fundo `surface-page`, texto `ink`, alvo 64px).
- [ ] **Step 6:** `pnpm mobile test` → PASS.
- [ ] **Step 7:** Build: `cd apps/mobile && JAVA_HOME=~/.sdkman/candidates/java/17.0.13-tem npx expo prebuild -p android && cd android && ./gradlew assembleDebug` → `BUILD SUCCESSFUL`.
- [ ] **Step 8: Commit** — `feat(mobile): app Expo SDK 58 com dev client e tema do design system`

### Task 3: Módulo `protecao-android` — núcleo Kotlin testável

**Files:**
- Create: `apps/mobile/modules/protecao-android/` via `pnpm create expo-module --local protecao-android` (só Android; remover `ios/` e web)
- Create: `.../android/src/main/java/com/saposidosos/protecao/Numero.kt`, `Decisao.kt`, `BaseLocal.kt`, `.../android/src/main/assets/base-embutida.json`
- Test: `.../android/src/test/java/com/saposidosos/protecao/NumeroTest.kt`, `DecisaoTest.kt`, `BaseLocalTest.kt`
- Modify: `.../android/build.gradle` (adicionar `testImplementation 'junit:junit:4.13.2'` e `testImplementation 'org.json:json:20240303'` para JSON na JVM)

**Interfaces:**
- Produces (Kotlin, pacote `com.saposidosos.protecao`):
  - `object Numero { fun normalizar(bruto: String?): String? }` → E.164 `+55…` ou `null`.
  - `enum class Regra { AVISAR, BLOQUEAR }`
  - `sealed class Decisao { object Permitir; data class Avisar(val numero: String, val tipo: String); data class Bloquear(val numero: String, val tipo: String) }`
  - `fun decidir(numeroBruto: String?, base: Map<String, String>, regra: Regra, podeAvisar: Boolean): Decisao`
  - `class BaseLocal(prefs: SharedPreferences, embutida: Map<String, String>)` com `fun numeros(): Map<String, String>`, `fun gravar(numeros: Map<String, String>, versao: Int)`, `fun adicionarTeste(numero: String, tipo: String)`, `fun versao(): Int`, `var regra: Regra`. Chaves de prefs: arquivo `protecao_base`, chaves `numeros` (JSON objeto número→tipo), `teste` (idem), `versao`, `regra`. `numeros()` = embutida ∪ gravados ∪ teste.
  - `base-embutida.json`: 10 números inventados (`+5511900000001`…`+5511900000010`) com tipos variados.

- [ ] **Step 1: Testes que falham**
  - `NumeroTest`: `normalizar("+5511987654321") == "+5511987654321"`; `normalizar("11987654321") == "+5511987654321"`; `normalizar("(11) 98765-4321") == "+5511987654321"`; `normalizar("011987654321") == "+5511987654321"`; `normalizar("01511987654321") == "+5511987654321"` (código de operadora 15); `normalizar("1133334444") == "+551133334444"`; `normalizar(null) == null`; `normalizar("") == null`; `normalizar("12345") == null`.
  - `DecisaoTest`: número fora da base → `Permitir`; na base com `AVISAR` e `podeAvisar=true` → `Avisar(numero, tipo)`; na base com `BLOQUEAR` → `Bloquear`; `semPermissaoDeAvisarNaoSilencia`: na base, `AVISAR`, `podeAvisar=false` → `Permitir`; `numeroOcultoPermite`: `null` → `Permitir`; formato diferente do da base (`11900000001` vs `+5511900000001`) → reconhece.
  - `BaseLocalTest` (prefs falsas em memória implementando `SharedPreferences`): sem nada gravado → só a embutida; `gravar` + `adicionarTeste` → união; `jsonInvalidoUsaEmbutida`: chave `numeros` = `"{quebrado"` → devolve a embutida sem lançar; `regra` padrão = `AVISAR`.
- [ ] **Step 2:** `cd apps/mobile/android && ./gradlew :protecao-android:testDebugUnitTest` → FAIL (classes não existem). Se o nome do projeto Gradle for outro, usar o que `./gradlew projects` listar.
- [ ] **Step 3:** Implementar `Numero.normalizar` (só dígitos; tira `0` + 2 dígitos de operadora quando há 13–14 dígitos começando com `0`; tira `0` sozinho com 11–12 dígitos; prefixa `55` para 10–11 dígitos; aceita 12–13 dígitos começando com `55`; resto → `null`), `decidir`, `BaseLocal` (escrita com `commit()`; JSON inválido cai em mapa vazio).
- [ ] **Step 4:** Mesmo comando → PASS.
- [ ] **Step 5: Commit** — `feat(protecao-android): normalização, decisão e base local com testes`

### Task 4: `CallScreeningService`, alerta em tela cheia e funções para o JS

**Files:**
- Create: `.../android/src/main/java/com/saposidosos/protecao/TriagemService.kt`, `AlertaNotificacao.kt`, `ProtecaoAndroidModule.kt` (substitui o gerado)
- Create: `apps/mobile/modules/protecao-android/plugin/index.ts` (config plugin), `apps/mobile/modules/protecao-android/index.ts`, `src/ProtecaoAndroid.types.ts`
- Modify: `apps/mobile/app.json` (plugin `./modules/protecao-android/plugin`)
- Test: `apps/mobile/modules/protecao-android/plugin/__tests__/plugin.test.ts`

**Interfaces:**
- Consumes: `decidir`, `BaseLocal`, `Regra` (Task 3).
- Produces (TS, `import * as Protecao from '@/modules/protecao-android'` ou caminho relativo):
  - `temPapelTriagem(): boolean`
  - `pedirPapelTriagem(): Promise<boolean>` (`RoleManager.createRequestRoleIntent(ROLE_CALL_SCREENING)`)
  - `ehTelaInicialPadrao(): boolean`
  - `abrirEscolhaTelaInicial(): void` (abre `Settings.ACTION_HOME_SETTINGS`)
  - `podeAvisar(): boolean` (notificações habilitadas e `canUseFullScreenIntent()` quando API ≥ 34)
  - `gravarBase(numeros: { numero: string; tipo: TipoGolpe }[], versao: number): void`
  - `adicionarNumeroTeste(numero: string, tipo: TipoGolpe): void`
  - `versaoBase(): number`, `totalNumeros(): number`
  - `definirRegra(regra: 'avisar' | 'bloquear'): void`, `regra(): 'avisar' | 'bloquear'`
  - `encerrarChamada(): boolean` (`TelecomManager.endCall()` em `try`; `false` sem permissão ou em erro)
  - `type TipoGolpe` = as 7 strings das Global Constraints.
  - Deep link do alerta: `saposidosos://alerta-ligacao?numero=<E.164 url-encoded>&tipo=<TipoGolpe>`.

- [ ] **Step 1: Teste que falha** — `plugin.test.ts`: aplica o plugin a um manifesto mínimo (objeto `modResults` de `withAndroidManifest`) e espera: `<service android:name="com.saposidosos.protecao.TriagemService" android:permission="android.permission.BIND_SCREENING_SERVICE" android:exported="true">` com `intent-filter` de ação `android.telecom.CallScreeningService`; permissões `USE_FULL_SCREEN_INTENT`, `POST_NOTIFICATIONS`, `ANSWER_PHONE_CALLS`; `MainActivity` com um `intent-filter` contendo `android.intent.action.MAIN`, `android.intent.category.HOME` e `android.intent.category.DEFAULT`.
- [ ] **Step 2:** `pnpm mobile test plugin` → FAIL.
- [ ] **Step 3:** Implementar o plugin com `withAndroidManifest` (consultar Context7 `/websites/expo_dev`, "config plugin withAndroidManifest").
- [ ] **Step 4:** `pnpm mobile test plugin` → PASS.
- [ ] **Step 5:** `TriagemService.onScreenCall(details)`: ignora chamadas que não sejam de entrada; `decidir(details.handle?.schemeSpecificPart, base.numeros(), base.regra, podeAvisar)`; `Permitir` → `respondToCall` padrão; `Avisar` → `setSilenceCall(true)` + `AlertaNotificacao.mostrar(context, numero, tipo)`; `Bloquear` → `setDisallowCall(true)`, `setRejectCall(true)`, `setSkipNotification(true)`. Responder sempre, inclusive em exceção (`try/finally` com resposta `Permitir`).
- [ ] **Step 6:** `AlertaNotificacao`: canal `alerta_ligacao` com importância `HIGH`; notificação de categoria `CALL`, prioridade máxima, `setFullScreenIntent(pendingIntent, true)` cujo `Intent(ACTION_VIEW, Uri.parse("saposidosos://alerta-ligacao?..."))` aponta para o app; título "Cuidado!", texto "Pode ser golpe. Não atenda.".
- [ ] **Step 7:** `ProtecaoAndroidModule` expõe as funções do Interfaces; `pedirPapelTriagem` usa `OnActivityResult` do Expo Modules API para resolver a Promise.
- [ ] **Step 8:** `npx expo prebuild -p android --clean && cd android && ./gradlew assembleDebug :protecao-android:testDebugUnitTest` → `BUILD SUCCESSFUL`; `grep -c TriagemService android/app/src/main/AndroidManifest.xml` → `1` ou mais.
- [ ] **Step 9: Commit** — `feat(protecao-android): serviço de triagem, alerta em tela cheia e config plugin`

### Task 5: Tela de alerta da ligação

**Files:**
- Create: `apps/mobile/app/alerta-ligacao.tsx`, `apps/mobile/src/textos.ts`
- Test: `apps/mobile/__tests__/alerta-ligacao.test.tsx`

**Interfaces:**
- Consumes: `encerrarChamada()` (Task 4); parâmetros `numero`, `tipo` via `useLocalSearchParams`.
- Produces: `descreverTipo(tipo: TipoGolpe): string` em `src/textos.ts` — `falso_banco` → "Finge ser do banco", `falso_parente` → "Finge ser alguém da família", `falso_inss` → "Finge ser do INSS", `pix_urgente` → "Pede Pix com pressa", `codigo_verificacao` → "Pede um código que chegou para você", `link_falso` → "Manda um link falso", `outro` → "Esse número já foi denunciado".

- [ ] **Step 1: Testes que falham** (módulo nativo mockado com `jest.mock`):
  - mostra "Cuidado!", o número formatado `(11) 90000-0001` e `descreverTipo(tipo)`;
  - "Não atender" aparece antes de "Atender mesmo assim" na árvore;
  - tocar "Não atender" chama `encerrarChamada` e depois `router.replace('/inicio')`;
  - "fecha quando encerrar falha": `encerrarChamada` devolve `false` → ainda chama `router.replace('/inicio')`; se lançar, idem;
  - tocar "Atender mesmo assim" não chama `encerrarChamada` e chama `router.back()` (ou `replace('/inicio')` sem histórico).
- [ ] **Step 2:** `pnpm mobile test alerta` → FAIL.
- [ ] **Step 3:** Implementar seguindo `docs/design/telas/IdosoLigacao.dc.html`: fundo `danger-deep` nos dois temas, cartão `alarm-card`, título `p-alert` 40px, botões 64px (`Não atender` cheio e maior), vibração `Haptics.notificationAsync(Warning)` ao montar, entrada por *fade*, sem deslize.
- [ ] **Step 4:** `pnpm mobile test alerta` → PASS.
- [ ] **Step 5: Commit** — `feat(mobile): tela de alerta de ligação suspeita`

### Task 6: Tela inicial (HOME), primeira execução e painel de demo

**Files:**
- Modify: `apps/mobile/app/inicio.tsx`
- Create: `apps/mobile/app/primeira-execucao.tsx`, `apps/mobile/app/demo.tsx`, `apps/mobile/src/atalhos.ts`, `apps/mobile/src/estadoPermissoes.ts`
- Test: `apps/mobile/__tests__/inicio.test.tsx`, `apps/mobile/__tests__/primeira-execucao.test.tsx`, `apps/mobile/__tests__/demo.test.tsx`

**Interfaces:**
- Consumes: funções da Task 4.
- Produces: `estadoPermissoes(): { telaInicial: boolean; triagem: boolean; avisar: boolean; encerrar: boolean }`; `proximaPendente(e): 'telaInicial' | 'triagem' | 'avisar' | 'encerrar' | null` (nessa ordem); `atalhos: { id: 'ligar' | 'whatsapp' | 'camera' | 'fotos'; rotulo: string; abrir(): Promise<void> }[]` (Ligar → `Linking.openURL('tel:')`, WhatsApp → `whatsapp://send`, Câmera e Fotos → intents via `expo-intent-launcher`).

- [ ] **Step 1: Testes que falham**
  - `inicio`: mostra relógio, selo "Protegida", os 4 atalhos e "Isso é golpe?"; "voltar não sai": o handler de `BackHandler` registrado devolve `true`; toque longo de 1s no relógio navega para `/demo`; com alguma permissão pendente, redireciona para `/primeira-execucao`.
  - `primeira-execucao`: `proximaPendente` segue a ordem tela inicial → triagem → avisar → encerrar; cada passo mostra uma frase e um botão com verbo ("Usar como tela inicial", "Ativar aviso de golpe", "Permitir avisos", "Permitir desligar golpista"); com tudo concedido, vai para `/inicio`.
  - `demo`: mostra versão da base, total de números e as 4 permissões; trocar a regra chama `definirRegra('bloquear')`; campo "Número de teste" + "Adicionar" chama `adicionarNumeroTeste(numero, 'falso_banco')`.
- [ ] **Step 2:** `pnpm mobile test` → FAIL nos três arquivos.
- [ ] **Step 3:** Implementar seguindo `docs/design/telas/Main.dc.html` (tiles `LauncherTile` 64px+, relógio `p-clock` 76px). Para `encerrar`, pedir `ANSWER_PHONE_CALLS` com `PermissionsAndroid`. Releitura das permissões ao voltar ao app (`AppState` → `active`).
- [ ] **Step 4:** `pnpm mobile test` → PASS.
- [ ] **Step 5: Commit** — `feat(mobile): tela inicial, primeira execução e painel de demo`

### Task 7: Verificação no aparelho real

**Files:**
- Create: `docs/roteiro-teste-aparelho.md`

- [ ] **Step 1:** Escrever o roteiro: instalar (`npx expo run:android --device`), conceder as 4 permissões, adicionar o número do celular de teste pelo painel de demo e então:
  - (a) ligar com o app aberto;
  - (b) ligar com a tela bloqueada;
  - (c) ligar com o app fechado à força;
  - (d) regra "bloquear";
  - (e) número fora da base toca normal;
  - (f) "Não atender" e "Atender mesmo assim";
  - (g) botão Home e botão voltar ficam na tela inicial;
  - (h) negar notificações → a ligação toca sem silenciar.
  
  Cada passo tem o resultado esperado.
- [ ] **Step 2:** Rodar o roteiro num aparelho conectado (`adb devices` listando o aparelho). Anotar marca, modelo e versão do Android, e o resultado de cada passo no próprio arquivo. Se não houver aparelho conectado, parar e pedir ao Pedro.
- [ ] **Step 3: Commit** — `docs: roteiro e resultado do teste no aparelho`
