import type { TipoGolpe } from '../modules/protecao-android';

const DESCRICOES: Record<TipoGolpe, string> = {
  falso_banco: 'Finge ser do banco',
  falso_parente: 'Finge ser alguém da família',
  falso_inss: 'Finge ser do INSS',
  pix_urgente: 'Pede Pix com pressa',
  codigo_verificacao: 'Pede um código que chegou para você',
  link_falso: 'Manda um link falso',
  outro: 'Esse número já foi denunciado',
};

export const ehTipoGolpe = (valor: unknown): valor is TipoGolpe =>
  typeof valor === 'string' && Object.hasOwn(DESCRICOES, valor);

export const descreverTipo = (tipo: TipoGolpe): string => DESCRICOES[tipo];

// Só formata número brasileiro: +55 DDD 9XXXX-XXXX (celular) ou DDD XXXX-XXXX (fixo).
export function formatarTelefone(e164: string): string {
  const celular = /^\+55(\d{2})(\d{5})(\d{4})$/.exec(e164);
  if (celular) return `(${celular[1]}) ${celular[2]}-${celular[3]}`;
  const fixo = /^\+55(\d{2})(\d{4})(\d{4})$/.exec(e164);
  if (fixo) return `(${fixo[1]}) ${fixo[2]}-${fixo[3]}`;
  return e164;
}
