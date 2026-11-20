import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

import {
  abrirEscolhaTelaInicial,
  ehTelaInicialPadrao,
  pedirPapelTriagem,
  podeAvisar,
  temPapelTriagem,
} from '../modules/protecao-android';

export type Passo = 'telaInicial' | 'triagem' | 'avisar' | 'encerrar';
export type EstadoPermissoes = Record<Passo, boolean>;

const ORDEM: Passo[] = ['telaInicial', 'triagem', 'avisar', 'encerrar'];

export async function estadoPermissoes(): Promise<EstadoPermissoes> {
  return {
    telaInicial: ehTelaInicialPadrao(),
    triagem: temPapelTriagem(),
    avisar: podeAvisar(),
    encerrar: await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS),
  };
}

export const proximaPendente = (e: EstadoPermissoes): Passo | null =>
  ORDEM.find((passo) => !e[passo]) ?? null;

// Executa a ação do passo. Quem chama relê o estado depois (também ao voltar das configurações).
export async function executarPasso(passo: Passo): Promise<void> {
  switch (passo) {
    case 'telaInicial':
      abrirEscolhaTelaInicial();
      return;
    case 'triagem':
      await pedirPapelTriagem();
      return;
    case 'avisar':
      if (Number(Platform.Version) >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      // Negado ou sem tela cheia (Android 14+): só as configurações do app resolvem.
      if (!podeAvisar()) await Linking.openSettings();
      return;
    case 'encerrar':
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS);
      return;
  }
}

// Lê o estado ao abrir e sempre que o app volta ao primeiro plano (depois de configurações ou diálogos).
export function usePermissoes() {
  const [estado, setEstado] = useState<EstadoPermissoes | null>(null);
  const reler = useCallback(async () => setEstado(await estadoPermissoes()), []);

  useEffect(() => {
    reler();
    const assinatura = AppState.addEventListener('change', (s) => {
      if (s === 'active') reler();
    });
    return () => assinatura.remove();
  }, [reler]);

  return { estado, reler };
}
