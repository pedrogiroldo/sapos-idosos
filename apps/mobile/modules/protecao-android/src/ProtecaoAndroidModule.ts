import { NativeModule, requireNativeModule } from 'expo';

import type { NumeroGolpe, Regra, TipoGolpe } from './ProtecaoAndroid.types';

declare class ProtecaoAndroidModule extends NativeModule<{}> {
  temPapelTriagem(): boolean;
  pedirPapelTriagem(): Promise<boolean>;
  ehTelaInicialPadrao(): boolean;
  abrirEscolhaTelaInicial(): void;
  podeAvisar(): boolean;
  podeUsarTelaCheia(): boolean;
  cancelarAlerta(): void;
  mostrarTelaChamada(): void;
  gravarBase(numeros: NumeroGolpe[], versao: number): void;
  adicionarNumeroTeste(numero: string, tipo: TipoGolpe): void;
  versaoBase(): number;
  totalNumeros(): number;
  definirRegra(regra: Regra): void;
  regra(): Regra;
  encerrarChamada(): boolean;
}

export default requireNativeModule<ProtecaoAndroidModule>('ProtecaoAndroid');
