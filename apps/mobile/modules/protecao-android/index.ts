// O alerta de ligação abre `saposidosos://alerta-ligacao?numero=<E.164>&tipo=<TipoGolpe>`.
import Nativo from './src/ProtecaoAndroidModule';
import type { NumeroGolpe, Regra, TipoGolpe } from './src/ProtecaoAndroid.types';

export type { NumeroGolpe, Regra, TipoGolpe } from './src/ProtecaoAndroid.types';

export const temPapelTriagem = (): boolean => Nativo.temPapelTriagem();
export const pedirPapelTriagem = (): Promise<boolean> => Nativo.pedirPapelTriagem();
export const ehTelaInicialPadrao = (): boolean => Nativo.ehTelaInicialPadrao();
export const abrirEscolhaTelaInicial = (): void => Nativo.abrirEscolhaTelaInicial();
export const podeAvisar = (): boolean => Nativo.podeAvisar();
export const cancelarAlerta = (): void => Nativo.cancelarAlerta();
export const mostrarTelaChamada = (): void => Nativo.mostrarTelaChamada();
export const gravarBase = (numeros: NumeroGolpe[], versao: number): void =>
  Nativo.gravarBase(numeros, versao);
export const adicionarNumeroTeste = (numero: string, tipo: TipoGolpe): void =>
  Nativo.adicionarNumeroTeste(numero, tipo);
export const versaoBase = (): number => Nativo.versaoBase();
export const totalNumeros = (): number => Nativo.totalNumeros();
export const definirRegra = (regra: Regra): void => Nativo.definirRegra(regra);
export const regra = (): Regra => Nativo.regra();
export const encerrarChamada = (): boolean => Nativo.encerrarChamada();
