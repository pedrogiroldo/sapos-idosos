import * as IntentLauncher from 'expo-intent-launcher';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

import {
  abrirEscolhaTelaInicial,
  ehTelaInicialPadrao,
  pedirPapelTriagem,
  podeAvisar,
  podeUsarTelaCheia,
  temPapelTriagem,
} from '../modules/protecao-android';

export type Passo = 'telaInicial' | 'triagem' | 'avisar' | 'encerrar';
export type EstadoPermissoes = Record<Passo, boolean>;

// Estado do módulo, vale por execução do app.
let primeiraVisitaFeita = false;
let negacoesTriagem = 0;

/** Só a primeira visita a /inicio em cada execução do app redireciona para a configuração. */
export function consumirPrimeiraVisita(): boolean {
  const eraPrimeira = !primeiraVisitaFeita;
  primeiraVisitaFeita = true;
  return eraPrimeira;
}

export function reiniciarEstadoDaExecucao() {
  primeiraVisitaFeita = false;
  negacoesTriagem = 0;
}

const ORDEM: Passo[] = ['telaInicial', 'triagem', 'avisar', 'encerrar'];
const TUDO_PENDENTE: EstadoPermissoes = {
  telaInicial: false,
  triagem: false,
  avisar: false,
  encerrar: false,
};
// Depois de duas negações o Android não mostra mais o pedido do papel.
const MAX_PEDIDOS_TRIAGEM = 2;
const PACOTE = 'package:com.saposidosos.app';

// Abre uma tela de configuração específica; se o aparelho não tiver, abre as configurações do app.
async function abrirConfiguracao(acao: string, params?: IntentLauncher.IntentLauncherParams) {
  try {
    await (params
      ? IntentLauncher.startActivityAsync(acao, params)
      : IntentLauncher.startActivityAsync(acao));
  } catch {
    await Linking.openSettings();
  }
}

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
      if (negacoesTriagem < MAX_PEDIDOS_TRIAGEM) {
        if (await pedirPapelTriagem()) return;
        negacoesTriagem += 1;
        if (negacoesTriagem < MAX_PEDIDOS_TRIAGEM) return;
      }
      await abrirConfiguracao('android.settings.MANAGE_DEFAULT_APPS_SETTINGS');
      return;
    case 'avisar': {
      const versao = Number(Platform.Version);
      let notificacoesLigadas = true;
      if (versao >= 33) {
        notificacoesLigadas =
          (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)) ===
          PermissionsAndroid.RESULTS.GRANTED;
      }
      if (podeAvisar()) return;
      // Android 14+: notificações ligadas mas sem tela cheia tem uma tela própria.
      if (versao >= 34 && notificacoesLigadas && !podeUsarTelaCheia()) {
        await abrirConfiguracao('android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT', { data: PACOTE });
        return;
      }
      await Linking.openSettings();
      return;
    }
    case 'encerrar':
      if (
        (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS)) !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        await Linking.openSettings();
      }
      return;
  }
}

// Lê o estado ao abrir e sempre que o app volta ao primeiro plano (depois de configurações ou diálogos).
export function usePermissoes() {
  const [estado, setEstado] = useState<EstadoPermissoes | null>(null);
  const reler = useCallback(async () => {
    try {
      setEstado(await estadoPermissoes());
    } catch {
      // Sem a leitura nativa, mostra tudo como pendente para a tela nunca ficar vazia.
      setEstado(TUDO_PENDENTE);
    }
  }, []);

  useEffect(() => {
    reler();
    const assinatura = AppState.addEventListener('change', (s) => {
      if (s === 'active') reler();
    });
    return () => assinatura.remove();
  }, [reler]);

  return { estado, reler };
}
