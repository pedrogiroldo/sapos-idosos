export type TipoGolpe =
  | 'falso_banco'
  | 'falso_parente'
  | 'falso_inss'
  | 'pix_urgente'
  | 'codigo_verificacao'
  | 'link_falso'
  | 'outro';

export type Regra = 'avisar' | 'bloquear';

export type NumeroGolpe = { numero: string; tipo: TipoGolpe };
