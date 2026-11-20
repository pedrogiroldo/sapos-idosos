import { AndroidConfig, type ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

type Manifesto = AndroidConfig.Manifest.AndroidManifest;
type FiltroIntent = NonNullable<AndroidConfig.Manifest.ManifestActivity['intent-filter']>[number];

const SERVICO_TRIAGEM = 'com.saposidosos.protecao.TriagemService';

const PERMISSOES = [
  'android.permission.USE_FULL_SCREEN_INTENT',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.ANSWER_PHONE_CALLS',
];

const nome = (valor: string) => ({ $: { 'android:name': valor } });

/** Registra o serviço de triagem, as permissões e a opção de ser a tela inicial. */
export function aplicarManifesto(manifesto: Manifesto): Manifesto {
  AndroidConfig.Permissions.ensurePermissions(manifesto, PERMISSOES);

  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifesto);
  const servicos = (app.service ?? []).filter((s) => s.$['android:name'] !== SERVICO_TRIAGEM);
  servicos.push({
    $: {
      'android:name': SERVICO_TRIAGEM,
      'android:permission': 'android.permission.BIND_SCREENING_SERVICE',
      'android:exported': 'true',
    },
    'intent-filter': [{ action: [nome('android.telecom.CallScreeningService')] }],
  });
  app.service = servicos;

  const atividade = AndroidConfig.Manifest.getMainActivityOrThrow(manifesto);
  const ehFiltroHome = (f: FiltroIntent) =>
    (f.category ?? []).some((c) => c.$['android:name'] === 'android.intent.category.HOME');
  const filtros = (atividade['intent-filter'] ?? []).filter((f) => !ehFiltroHome(f));
  filtros.push({
    action: [nome('android.intent.action.MAIN')],
    category: [nome('android.intent.category.HOME'), nome('android.intent.category.DEFAULT')],
  });
  atividade['intent-filter'] = filtros;

  // Sem isso, Linking.canOpenURL('whatsapp://send') sempre dá false no Android 11+.
  type Consultas = { intent?: { data?: { $: { 'android:scheme': string } }[] }[] };
  const raiz = manifesto.manifest as unknown as { queries?: Consultas[] };
  const consultas = raiz.queries ?? [{}];
  const jaTem = consultas.some((q) =>
    (q.intent ?? []).some((i) => (i.data ?? []).some((d) => d.$['android:scheme'] === 'whatsapp')),
  );
  if (!jaTem) {
    consultas[0].intent = [
      ...(consultas[0].intent ?? []),
      { data: [{ $: { 'android:scheme': 'whatsapp' } }] },
    ];
  }
  raiz.queries = consultas;

  return manifesto;
}

const withProtecaoAndroid: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    config.modResults = aplicarManifesto(config.modResults);
    return config;
  });

export default withProtecaoAndroid;
