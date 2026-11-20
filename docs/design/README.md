# App família — design system

Design system do app família anti-golpe do Hack Brasil 2026. O filho ou neto instala o app no celular do pai, da mãe ou dos avós. O app junta o verificador "Isso é golpe?", a triagem de ligações suspeitas e um launcher simples para Android.

Esta é a versão 2, no estilo Apple: fonte do sistema, listas agrupadas, cápsulas, materiais translúcidos e movimento por molas. Ela segue o que a Apple ensina nas palestras de design da WWDC, com uma regra por cima de tudo: **para quem tem 70 anos, legibilidade vence elegância.** Onde as duas brigam, como na transparência, no cinza claro e no quique, ganha a legibilidade.

O mesmo app tem dois modos:

| | Modo protegido | Modo família |
|---|---|---|
| Quem usa | O idoso, no celular dele | O filho ou neto que gerencia |
| Plataforma | Android 10+ (é o launcher) | Android e iPhone |
| Texto mínimo | 17px (`p-label`); frases em 20px (`p-body`) | 12px (`f-badge`); frases em 17px (`f-body`) |
| Alvo de toque | 64px (`target-protected`) | 50px (`target-family`), nunca abaixo de 48px |
| Superfícies | Sólidas, sem transparência | Listas agrupadas, barra e folha translúcidas |
| Movimento | Mola sem quique, sempre | Mola sem quique; quique leve só após arremesso |

"App família" é nome provisório: o produto ainda não tem nome nem logo.

## Princípios

1. **Calma, não medo.** O app existe para a pessoa parar e pensar. Vermelho forte só quando há risco real e imediato. O resto é neutro, claro e com muito respiro.
2. **Resposta no toque.** Tudo que é tocável reage no instante em que o dedo encosta, não quando solta. Para quem tem dúvida se "pegou", a resposta imediata evita o toque repetido.
3. **Uma decisão por tela.** No modo protegido, cada tela tem uma pergunta e no máximo duas respostas. A resposta segura vem primeiro e maior.
4. **Nunca só a cor.** Todo estado tem símbolo e palavra. Verde e vermelho se confundem para quem tem daltonismo comum.
5. **Aconselhar, não bloquear.** "Atender mesmo assim" sempre existe. Desfazer é fácil; confirmação só para o que não tem volta.
6. **O familiar vê o risco, não a vida.** O painel mostra que houve uma tentativa de golpe e de que tipo, nunca o conteúdo da conversa. O idoso consente na tela dele (LGPD).

## Voz e texto

Escreva como um neto paciente falaria com a avó.

- Frases curtas, uma ideia por frase, tratando por "você".
- Ordem direta no veredito: "Pare. É golpe." e "**Não faça o Pix.**"
- Palavras do dia a dia: "pode ser golpe", "finge ser do banco", "pressa para você não pensar". Evite "phishing", "spam", "fraude", "engenharia social".
- Botões com verbo e objeto: "Ligar para a Juliana", "Não atender", "Colar mensagem". Evite "OK", "Continuar", "Confirmar".
- Nunca culpe a pessoa. "Já fiz o Pix" leva a ajuda, não a sermão.
- Diga "Parece seguro", nunca "É seguro": o app pode errar.
- Nomes como a família chama: "Mãe (Cida)", "Vô Zé". Abas com nome do conteúdo: "Família", "Alertas", não "Início".
- Sem emoji, sem ponto de exclamação fora do título do alarme ("Cuidado!").

## Cores

Neutros e estados vêm das cores de sistema da Apple, nas **variantes de alto contraste**, que a própria Apple usa quando a pessoa liga "Aumentar contraste". As padrões não servem aqui: o verde `#34C759` dá 2,2:1 com texto branco e o vermelho `#FF3B30` dá 3,6:1. A marca não usa o azul do sistema, que faz o app parecer um app qualquer: é um índigo próprio. Todo texto deste sistema passa 4,5:1 sobre o fundo indicado na nota do token, nos dois temas.

- **Neutros:** `surface-page` (cinza agrupado do iOS), `surface-card`, `surface-raised`, `fill`, `line`, `line-strong`, `ink`, `ink-muted`. O texto secundário é `#636366`, não o cinza de 60% do iOS, que some para olhos mais velhos.
- **Marca (índigo `#4b3fc7`):** `brand` preenche o botão principal e o quadrado dos tiles de mídia; `brand-soft` faz o botão tingido; `brand-ink` é para links, botões de texto, aba ativa e foco. Índigo é ação, nunca estado. Ele foi escolhido por ficar longe do verde, do laranja e do vermelho dos estados, tanto no tom quanto na luminosidade.
- **Seguro (verde):** `safe` é a saída segura depois de um alerta e o quadrado de falar no launcher. `safe-soft` e `safe-ink` fazem o selo "Protegida" e o "Parece seguro".
- **Atenção (laranja):** `caution-*` é para algo que o familiar precisa conferir e para "Não deu para ter certeza". Não use para golpe.
- **Perigo (vermelho):** `danger` para golpe; `danger-soft` e `danger-ink` para o veredito e as notas. `danger-deep` só na tela de ligação suspeita, igual nos dois temas, com `alarm-card` por cima.
- **Monogramas:** `avatar-blue`, `avatar-amber`, `avatar-green` são só identidade.
- **Materiais:** `material-bar`, `material-thick` e `scrim`. Veja abaixo.

## Tipografia

**Fonte do sistema:** SF Pro no iPhone, Roboto no Android. No Expo, basta não definir `fontFamily`. Ela já vem com ajuste ótico por tamanho e acompanha o tamanho de texto que a pessoa escolheu no celular. O relógio usa a versão arredondada (`rounded`), como a tela de bloqueio.

- **Escala do modo família = Dynamic Type do iOS:** `f-title` 34 (Large Title), `f-section` 20 (Title 3), `f-heading` e `f-body` 17 (Headline e Body), `f-small` 15 (Subheadline), `f-meta` 13 (Footnote), `f-badge` 12 (Caption).
- **Modo protegido, um degrau acima:** `p-clock` 76, `p-alert` 40, `p-verdict` 34, `p-action` 20/600, `p-body` 20, `p-label` 17/600.
- **Espaçamento entre letras muda com o tamanho:** títulos grandes apertam (−0,02 a −0,035em), corpo fica em 0, textos de 12–13px abrem um pouco (+0,01em). Nunca um valor único para tudo.
- **Altura de linha inversa ao tamanho:** 1,0–1,05 nos títulos enormes, 1,4 no corpo do modo protegido.
- **Hierarquia por peso**, não só por tamanho: 600 para nomes e botões, 700 só nos títulos de tela.
- Respeite o tamanho de fonte do sistema (`allowFontScaling`). As telas do modo protegido precisam caber com escala 1,3: role a tela, não diminua o texto.

## Forma e espaço

- **Espaço** em grade de 4px, de `space-1` (4) a `space-12` (48). Margem lateral de 20px no modo protegido e de 16px no modo família.
- **Cantos grandes e contínuos:** `radius-sm` 10, `radius-md` 14 (quadrado de símbolo), `radius-lg` 22 (lista agrupada, cartão, veredito), `radius-xl` 28 (tile, folha, alarme), `radius-full` para botões, selos e avatares. No iOS, use `borderCurve: 'continuous'` para o canto "squircle".
- **Sem bordas nem sombras em superfícies paradas:** a separação vem do cartão branco sobre o cinza agrupado. Sombra só no que flutua (`shadow-float`, `shadow-sheet`); superfície maior, sombra mais funda.
- **Listas agrupadas (inset grouped):** grupo com título em `f-section`, separadores de 0,5px recuados até o texto, seta à direita quando a linha abre algo, rodapé curto em `f-meta`.

## Materiais

A barra de abas e a folha são camadas de material translúcido: o conteúdo continua visível e borrado por baixo, então a pessoa não perde o contexto.

- `material-bar` + desfoque de 20px: barra de abas flutuante do modo família.
- `material-thick` + desfoque de 30px: folha. Atrás dela, `scrim` escurece o fundo, porque a folha interrompe a tarefa.
- **Nunca no modo protegido.** Texto sobre material translúcido perde contraste conforme o fundo muda, e isso pesa mais para quem enxerga menos. Lá, superfícies sólidas.
- Nunca material claro sobre material claro.
- Com "Reduzir transparência" ligado, os materiais viram `surface-card` e `surface-raised` sólidos. Com "Aumentar contraste", as superfícies ganham contorno em `line-strong`.

## Movimento

Movimento por **molas**, nunca por animações de duração fixa: uma mola pode ser interrompida e redirecionada a qualquer momento. As constantes estão em `expo/theme.ts` (`spring`, `press`, `project`, `rubberband`) e entram no `withSpring` do Reanimated, que aceita `dampingRatio` e `duration`. O `duration` do Reanimated é uma aproximação da "resposta" da Apple: ajuste no aparelho até sentir igual ao protótipo da Sheet.

- **Padrão: amortecimento 1, sem quique**, resposta de 0,35s. O modo protegido usa só isso: quique distrai e pode dar enjoo.
- **Quique leve (0,85) só depois de um arremesso** no modo família, quando o próprio gesto trouxe impulso.
- **Toque:** escala 0,97 no *pointer-down* em 100ms; a ação dispara na soltura; arrastar para fora cancela.
- **Arrastar:** o elemento segue o dedo 1:1, a partir de onde foi pego. Ao soltar, projete o ponto de chegada pela velocidade (`project`, desaceleração 0,998), escolha o destino a partir dessa projeção e comece a mola com a velocidade do dedo. Além do limite, resista (`rubberband`) em vez de travar.
- **Interromper:** toda animação pode ser pega no meio. Comece sempre do valor que está na tela, nunca do destino.
- **Caminho de volta = caminho de ida.** A folha sobe da base e desce para a base; o detalhe de um aparelho entra pela direita e sai pela direita.
- **Alarme não desliza:** CallAlert e Verdict aparecem com *fade* curto. Movimento lateral sugere navegação, e isso é um aviso.
- **Reduzir movimento:** troque deslizes e molas por *fade* de 150–200ms. A resposta ao toque vira mudança de opacidade.

## Vibração e som

Só onde importa, sempre no **mesmo quadro** da mudança na tela (`expo-haptics`):

- Tela de ligação suspeita: vibração de aviso (`Warning`) junto com o toque normal da chamada.
- Veredito: `Error` para golpe, `Success` para "Parece seguro", nada para "Não deu para ter certeza".
- Nada em toque comum de botão ou tile. Vibrar demais ensina a ignorar.

## Símbolos

Traço em grade de 24×24, cantos arredondados, traço 2 a 2,6, no espírito dos SF Symbols. No iPhone, use os próprios SF Symbols (`expo-symbols`); no Android, `lucide-react-native` com o mesmo desenho. Tamanhos em `size`: 30 no quadrado do tile, 24 em botões, 22 em abas.

Significados fixos: escudo com check = protegido; triângulo = atenção ou ligação suspeita; círculo com "!" = golpe; lupa = "Isso é golpe?"; telefone e balão = falar.

## Componentes

Componentes de referência em CSS (`components/bundle.css`, prefixo `.af-`), feitos para orientar a implementação em React Native, não para importar no app. Cada um tem guia em `components/<Nome>/README.md`. A folha (Sheet) tem um protótipo interativo com a mola de verdade: arraste-a.

- **Ações:** Button.
- **Estado:** StatusBadge, Notice.
- **Modo protegido:** LauncherTile, ContactAvatar, Verdict, CallAlert, Sheet.
- **Modo família:** DeviceCard, AlertRow, TabBar.

## Usando no Expo

`expo/theme.ts` traz os tokens como constantes TypeScript (`colors.light`, `colors.dark`, `space`, `radius`, `size`, `type`) e o movimento (`spring`, `press`, `project`, `rubberband`). Escolha o tema com `useColorScheme()`. Leia "Reduzir movimento" com `AccessibilityInfo.isReduceMotionEnabled()` e "Reduzir transparência" com `AccessibilityInfo.isReduceTransparencyEnabled()` (iOS).

## Android e familiaridade

O modo protegido roda em Android, e quem o usa já conhece o Android. Por isso o estilo Apple entra pelos princípios (resposta, molas, tipografia, cores de alto contraste, listas agrupadas) e não pela cópia de peças do iOS: no Android a fonte é Roboto, o gesto de voltar do sistema continua valendo e "Voltar ao início" fica sempre visível.

## Histórico

- **v2.1 (19/11/2026):** marca trocada do azul de sistema (`#0064d2`) para índigo (`#4b3fc7`; no escuro, `#5a4fd8`, `#a49bff` e `#1f1a4d`).
- **v2 (19/11/2026):** estilo Apple. Fonte do sistema no lugar de Inter e Space Grotesk; cores de sistema da Apple em alto contraste; cápsulas, listas agrupadas, cantos maiores, materiais e molas; componente Sheet. A v1 continua no histórico de versões desta página.
- **v1 (19/11/2026):** extraída das telas do app família.
