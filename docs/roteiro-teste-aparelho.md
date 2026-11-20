# Roteiro de teste no aparelho real

Verifica a triagem de ligações suspeitas (Android 10+) num celular de verdade.
Emulador não serve: ele não recebe ligação de um número de fora.

Não escreva números de telefone reais neste arquivo. Use apenas "celular de teste" nos campos abaixo.

## Identificação do aparelho (preencher)

| Campo | Valor |
|---|---|
| Marca | |
| Modelo | |
| Versão do Android | |
| Data do teste | |
| Quem testou | |

Teste em pelo menos duas marcas (uma Xiaomi/Redmi/Poco e uma Samsung): essas marcas
costumam matar apps em segundo plano e podem impedir o serviço de triagem de rodar.
Use uma tabela de resultados por marca (copie a tabela do fim do arquivo).

## Pré-requisitos

- Celular com depuração USB ligada e conectado (`adb devices` lista o aparelho).
- Um segundo celular (o "celular de teste") para fazer as ligações.
- O número do celular de teste NÃO pode estar na lista de contatos do aparelho testado.
  O Android só envia à triagem ligações de números que não são contatos.
- Aparelho testado com chip e rede móvel funcionando.

## Instalação

Compilação com JDK 17:

```bash
export JAVA_HOME=~/.sdkman/candidates/java/17.0.13-tem
export ANDROID_HOME=/home/pedrogiroldo/Android/Sdk
cd apps/mobile
npx expo run:android --device
```

Alternativa (só a arquitetura do aparelho, compila mais rápido). Gere o projeto nativo
uma vez com `npx expo prebuild --platform android` se a pasta `android/` ainda não existir; depois:

```bash
cd apps/mobile/android
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

O build de desenvolvimento precisa do Metro rodando, em outro terminal:

```bash
cd apps/mobile
npx expo start --dev-client
```

Com o aparelho no USB, se o app não achar o Metro: `adb reverse tcp:8081 tcp:8081`.

Log do serviço de triagem (deixe aberto durante o teste):

```bash
adb logcat -s TriagemService:V ProtecaoAndroid:V
```

Só aparecem linhas quando algo dá errado (erro na triagem cai em "a ligação vai passar normalmente").

## Preparação (uma vez)

1. Abra o app. Na primeira execução aparece "Vamos proteger seu celular", com 4 passos
   (cada toque leva ao diálogo do Android; ao voltar, o app avança sozinho):
   1. "Usar como tela inicial": escolha "App família" e "Sempre".
   2. "Ativar aviso de golpe": aceite o papel de triagem de chamadas.
   3. "Permitir avisos": aceite notificações (e, no Android 14+, o uso de tela cheia, nas configurações do app).
   4. "Permitir desligar golpista": aceite "Fazer e gerenciar chamadas".
   Esperado: ao concluir os 4, abre a tela inicial com o selo "Protegida" e sem a faixa "Falta ativar a proteção".
2. Abra o painel de demonstração: **segure o relógio por 1 segundo** na tela inicial.
   Confira que as 4 linhas de permissão dizem "sim".
3. No campo "Número de teste", digite o número do celular de teste (com DDD) e toque em "Adicionar".
   Esperado: "Números na base" aumenta em 1; o campo esvazia. O tipo gravado é "falso_banco".
4. Confira que a linha "Regra" mostra "avisar" (se não, toque no botão para trocar).
5. Toque em "Voltar ao início".

## Passos

Em todos, a ligação vem do celular de teste para o aparelho testado.

### (a) Ligar com o app aberto

- Deixe o app na tela inicial e ligue.
- Esperado: o telefone NÃO toca (silenciado) e a tela vermelha "Cuidado! Pode ser golpe" abre em tela cheia,
  com o número do celular de teste formatado, o texto do tipo de golpe e os botões "Não atender" e "Atender mesmo assim".

### (b) Ligar com a tela bloqueada

- Bloqueie a tela, espere apagar e ligue.
- Esperado: a tela acende e mostra o alerta "Cuidado! Pode ser golpe" por cima do bloqueio (tela cheia),
  sem tocar. Se só aparecer a notificação "Cuidado! Pode ser golpe. Não atenda.", anote nas observações
  (no Android 14+ depende da permissão de tela cheia).

### (c) Ligar com o app fechado à força

- Em Configurações > Apps > (app) > "Forçar parada" (ou deslize o app fora dos recentes e force a parada). Bloqueie a tela se quiser.
- Ligue.
- Esperado: o Android inicia o serviço sozinho; o alerta aparece como em (a)/(b), sem abrir o app antes.
- Nas marcas Xiaomi/Samsung, se não funcionar, anote. Depois ative "Início automático" / "Sem restrições de bateria"
  para o app e repita; registre se isso resolveu.

### (d) Regra "bloquear"

- No painel de demonstração (segure o relógio 1 s), toque em "Trocar para bloquear". Confira "Regra: bloquear".
- Ligue.
- Esperado: a ligação é recusada sem tocar e sem alerta; no celular de teste, a chamada cai/dá ocupado.
  Em geral não fica registro de chamada perdida no aparelho testado.
- Ao terminar, volte a regra para "avisar".

### (e) Número fora da base toca normal

- Ligue de um terceiro número que NÃO esteja na base (ou, sem terceiro aparelho, remova o celular de teste
  limpando os dados do app em Configurações e refaça só a preparação sem adicionar o número).
- Esperado: o telefone toca normalmente e nenhum alerta aparece. Com regra "bloquear" também toca (só números da base são bloqueados).

### (f) "Não atender" e "Atender mesmo assim"

Regra "avisar". Faça duas ligações.

1. Ligue e toque em "Não atender".
   Esperado: a ligação é encerrada (no celular de teste, a chamada cai) e o app volta à tela inicial.
   Sem a permissão "Fazer e gerenciar chamadas", a ligação continua e o app volta à tela inicial.
2. Ligue de novo e toque em "Atender mesmo assim".
   Esperado: o app volta à tela inicial. A ligação NÃO é encerrada e continua silenciada pela triagem;
   para atender, use a tela do telefone (discador/notificação de chamada do Android). Anote como ficou a experiência.

### (g) Botão Home e botão voltar ficam na tela inicial

- Na tela inicial do app, aperte o botão Home do Android.
  Esperado: continua na tela do app (é a tela inicial padrão), sem abrir seletor.
- Aperte o botão voltar (ou o gesto de voltar) várias vezes.
  Esperado: nada acontece; o app não fecha nem sai para outra tela.
- Abra um atalho (ex.: Câmera) e volte com o botão voltar: deve retornar à tela inicial do app.

### (h) Negar notificações: a ligação toca sem silenciar

- Configurações > Apps > (app) > Notificações: desligue. (No Android 14+, também vale desligar o uso de tela cheia.)
  Confirme no painel de demonstração: "Avisos: não".
- Regra "avisar". Ligue do celular de teste.
- Esperado: o telefone TOCA normalmente, sem alerta e sem silenciar (o app não pode avisar, então deixa a ligação passar).
- Ao terminar, religue as notificações.

## Resultados

Uma linha por passo. Preencher "Resultado" com OK / FALHOU / PARCIAL.

| Passo | Descrição | Resultado | Observações |
|---|---|---|---|
| a | Ligar com o app aberto | | |
| b | Ligar com a tela bloqueada | | |
| c | Ligar com o app fechado à força | | |
| d | Regra "bloquear" | | |
| e | Número fora da base toca normal | | |
| f | "Não atender" e "Atender mesmo assim" | | |
| g | Home e voltar ficam na tela inicial | | |
| h | Notificações negadas: toca sem silenciar | | |
