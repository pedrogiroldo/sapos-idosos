import { descreverTipo, formatarTelefone } from '../src/textos';

describe('formatarTelefone', () => {
  it('formata celular com 9 dígitos', () => {
    expect(formatarTelefone('+5511900000001')).toBe('(11) 90000-0001');
  });
  it('formata fixo', () => {
    expect(formatarTelefone('+551133334444')).toBe('(11) 3333-4444');
  });
  it('devolve o resto sem mudar', () => {
    expect(formatarTelefone('+14155550100')).toBe('+14155550100');
    expect(formatarTelefone('abc')).toBe('abc');
    expect(formatarTelefone('')).toBe('');
  });
});

describe('descreverTipo', () => {
  it('descreve cada tipo', () => {
    expect(descreverTipo('falso_banco')).toBe('Finge ser do banco');
    expect(descreverTipo('falso_parente')).toBe('Finge ser alguém da família');
    expect(descreverTipo('falso_inss')).toBe('Finge ser do INSS');
    expect(descreverTipo('pix_urgente')).toBe('Pede Pix com pressa');
    expect(descreverTipo('codigo_verificacao')).toBe('Pede um código que chegou para você');
    expect(descreverTipo('link_falso')).toBe('Manda um link falso');
    expect(descreverTipo('outro')).toBe('Esse número já foi denunciado');
  });
});
