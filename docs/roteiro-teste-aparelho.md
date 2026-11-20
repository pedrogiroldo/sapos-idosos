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
- Um terceiro celular, com número fora da base, para o passo (e).
- O número do celular de teste NÃO pode estar na lista de contatos do aparelho testado.
  O Android só envia à triagem ligações de números que não são contatos.
- Aparelho testado com chip e rede móvel funcionando.

## Instalação

Os testes (a) a (h) rodam num build **release**, com o JavaScript embutido no APK:
assim o alerta abre mesmo com o app fechado à força e sem computador por perto.
O template do Expo assina o release com a chave de depuração, então não precisa de chave própria.

```bash
export JAVA_HOME=~/.sdkman/candidates/java/17.0.13-tem
export ANDROID_HOME=/home/pedrogiroldo/Android/Sdk
cd apps/mobile
npx expo run:android --variant release --device
```

Não precisa do Metro para o build release.

### Só para desenvolvimento (não use para os testes (a)–(h))

O build de desenvolvimento depende do Metro rodando no computador:

```bash
cd apps/mobile
npx expo run:android --device        # instala o build de desenvolvimento
npx expo start --dev-client          # em outro terminal
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
   1. "Usar como tela inicial": abre a tela "App de início padrão" do Android (não há botão "Sempre").
      Marque "App família" como app de início e volte.
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
- Esperado: o telefone NÃO toca (silenciado) e a tela vermelha "Cuidado! Pode ser golpe" abre direto,
  com o número do celular de teste formatado, o texto do tipo de golpe e os botões "Não atender" e "Atender mesmo assim".
- Se em vez disso aparecer só a notificação no topo ("Cuidado! Pode ser golpe. Não atenda."), toque nela:
  ela deve abrir o mesmo alerta. Anote nas observações qual dos dois aconteceu.

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

- Precisa de um terceiro celular, cujo número NÃO esteja na base (e que também não seja contato do aparelho testado).
  Ligue dele.
- Esperado: o telefone toca normalmente e nenhum alerta aparece. Com regra "bloquear" também toca (só números da base são bloqueados).

### (f) "Não atender" e "Atender mesmo assim"

Regra "avisar". Faça duas ligações.

1. Ligue e toque em "Não atender".
   Esperado: a ligação é encerrada (no celular de teste, a chamada cai) e o app volta à tela inicial.
   Sem a permissão "Fazer e gerenciar chamadas", a ligação continua e o app volta à tela inicial.
2. Ligue de novo e toque em "Atender mesmo assim".
   Esperado: o aviso some e a tela de ligação do Android vem para a frente, para atender ali.
   A ligação NÃO é encerrada (continua silenciada pela triagem). Se a tela de ligação não aparecer
   e o app só sair da frente, anote; atender pela notificação de chamada também vale.

### (g) Botão Home e botão voltar ficam na tela inicial

- Na tela inicial do app, aperte o botão Home do Android.
  Esperado: continua na tela do app (é a tela inicial padrão), sem abrir seletor.
- Aperte o botão voltar (ou o gesto de voltar) várias vezes.
  Esperado: nada acontece; o app não fecha nem sai para outra tela.
- Abra um atalho (ex.: Câmera) e volte com o botão voltar: deve retornar à tela inicial do app.
- Toque em "Isso é golpe?" e aperte voltar: deve voltar à tela inicial (o voltar só fica preso na tela inicial).

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
