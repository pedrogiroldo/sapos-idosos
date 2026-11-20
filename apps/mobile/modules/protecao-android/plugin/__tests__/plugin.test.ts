import type { AndroidConfig } from 'expo/config-plugins';

import { aplicarManifesto } from '..';

type Manifesto = AndroidConfig.Manifest.AndroidManifest;

function manifestoMinimo(): Manifesto {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      'uses-permission': [{ $: { 'android:name': 'android.permission.INTERNET' } }],
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          activity: [
            {
              $: { 'android:name': '.MainActivity' },
              'intent-filter': [
                {
                  action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
                  category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
                },
              ],
            },
          ],
        },
      ],
    },
  } as Manifesto;
}

const nomes = (itens?: { $: { 'android:name': string } }[]) =>
  (itens ?? []).map((item) => item.$['android:name']);

describe('plugin protecao-android', () => {
  it('registra o TriagemService com a permissão de triagem e o intent-filter', () => {
    const app = aplicarManifesto(manifestoMinimo()).manifest.application![0];
    const servicos = (app.service ?? []).filter(
      (s) => s.$['android:name'] === 'com.saposidosos.protecao.TriagemService',
    );
    expect(servicos).toHaveLength(1);
    const [servico] = servicos;
    expect(servico.$['android:permission']).toBe('android.permission.BIND_SCREENING_SERVICE');
    expect(servico.$['android:exported']).toBe('true');
    const acoes = (servico['intent-filter'] ?? []).flatMap((f) => nomes(f.action));
    expect(acoes).toContain('android.telecom.CallScreeningService');
  });

  it('pede as permissões de alerta e de encerrar chamada, sem perder as existentes', () => {
    const permissoes = nomes(aplicarManifesto(manifestoMinimo()).manifest['uses-permission']);
    expect(permissoes).toEqual(
      expect.arrayContaining([
        'android.permission.INTERNET',
        'android.permission.USE_FULL_SCREEN_INTENT',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.ANSWER_PHONE_CALLS',
      ]),
    );
  });

  it('deixa a MainActivity ser escolhida como tela inicial', () => {
    const atividade = aplicarManifesto(manifestoMinimo()).manifest.application![0].activity![0];
    const filtroHome = (atividade['intent-filter'] ?? []).find((f) =>
      nomes(f.category).includes('android.intent.category.HOME'),
    );
    expect(filtroHome).toBeDefined();
    expect(nomes(filtroHome!.action)).toContain('android.intent.action.MAIN');
    expect(nomes(filtroHome!.category)).toContain('android.intent.category.DEFAULT');
  });

  it('mantém o intent-filter MAIN + LAUNCHER da MainActivity', () => {
    const atividade = aplicarManifesto(manifestoMinimo()).manifest.application![0].activity![0];
    const filtroLauncher = (atividade['intent-filter'] ?? []).find((f) =>
      nomes(f.category).includes('android.intent.category.LAUNCHER'),
    );
    expect(filtroLauncher).toBeDefined();
    expect(nomes(filtroLauncher!.action)).toContain('android.intent.action.MAIN');
  });

  it('não duplica nada quando aplicado duas vezes', () => {
    const manifesto = aplicarManifesto(aplicarManifesto(manifestoMinimo()));
    const app = manifesto.manifest.application![0];
    expect(app.service).toHaveLength(1);
    const permissoes = nomes(manifesto.manifest['uses-permission']);
    expect(new Set(permissoes).size).toBe(permissoes.length);
    const filtrosHome = (app.activity![0]['intent-filter'] ?? []).filter((f) =>
      nomes(f.category).includes('android.intent.category.HOME'),
    );
    expect(filtrosHome).toHaveLength(1);
  });
});
