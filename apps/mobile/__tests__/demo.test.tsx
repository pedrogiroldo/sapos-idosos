import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { PermissionsAndroid, StyleSheet } from 'react-native';

import Demo from '../app/demo';
import * as nativo from '../modules/protecao-android';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../modules/protecao-android', () => ({
  ehTelaInicialPadrao: jest.fn(() => true),
  temPapelTriagem: jest.fn(() => false),
  podeAvisar: jest.fn(() => true),
  versaoBase: jest.fn(() => 7),
  totalNumeros: jest.fn(),
  regra: jest.fn(() => 'avisar'),
  definirRegra: jest.fn(),
  adicionarNumeroTeste: jest.fn(),
}));

const mock = (f: unknown) => f as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mock(nativo.totalNumeros).mockReturnValue(3);
  mock(nativo.regra).mockReturnValue('avisar');
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
});

describe('painel de demo', () => {
  it('mostra versão da base, total de números e as 4 permissões', async () => {
    await render(<Demo />);
    expect(await screen.findByText('Versão da base: 7')).toBeTruthy();
    expect(screen.getByText('Números na base: 3')).toBeTruthy();
    expect(screen.getByText('Tela inicial: sim')).toBeTruthy();
    expect(screen.getByText('Triagem de chamadas: não')).toBeTruthy();
    expect(screen.getByText('Avisos: sim')).toBeTruthy();
    expect(screen.getByText('Desligar chamada: não')).toBeTruthy();
  });

  it('mostra a regra atual e trocar chama definirRegra("bloquear")', async () => {
    await render(<Demo />);
    await screen.findByText('Versão da base: 7');
    expect(screen.getByText('Regra: avisar')).toBeTruthy();
    await fireEvent.press(screen.getByText('Trocar para bloquear'));
    expect(nativo.definirRegra).toHaveBeenCalledWith('bloquear');
    expect(screen.getByText('Regra: bloquear')).toBeTruthy();
  });

  it('adiciona o número digitado como falso_banco e atualiza o total', async () => {
    await render(<Demo />);
    await screen.findByText('Versão da base: 7');
    mock(nativo.totalNumeros).mockReturnValue(4);
    await fireEvent.changeText(screen.getByPlaceholderText('Número de teste'), '+5511900000009');
    await fireEvent.press(screen.getByText('Adicionar'));
    expect(nativo.adicionarNumeroTeste).toHaveBeenCalledWith('+5511900000009', 'falso_banco');
    expect(screen.getByText('Números na base: 4')).toBeTruthy();
  });

  it('avisa quando o número não entrou na base', async () => {
    await render(<Demo />);
    await screen.findByText('Versão da base: 7');
    await fireEvent.changeText(screen.getByPlaceholderText('Número de teste'), '123');
    await fireEvent.press(screen.getByText('Adicionar'));
    const aviso = screen.getByText('Número inválido. Use DDD + número.');
    expect(StyleSheet.flatten(aviso.props.style).fontSize).toBeGreaterThanOrEqual(17);
    expect(screen.getByText('Números na base: 3')).toBeTruthy();
  });

  it('não mostra o aviso quando o número entrou', async () => {
    await render(<Demo />);
    await screen.findByText('Versão da base: 7');
    mock(nativo.totalNumeros).mockReturnValue(4);
    await fireEvent.changeText(screen.getByPlaceholderText('Número de teste'), '11900000009');
    await fireEvent.press(screen.getByText('Adicionar'));
    expect(screen.queryByText('Número inválido. Use DDD + número.')).toBeNull();
  });

  it('"Voltar ao início" volta para /inicio', async () => {
    await render(<Demo />);
    await fireEvent.press(await screen.findByText('Voltar ao início'));
    expect(router.replace).toHaveBeenCalledWith('/inicio');
  });
});
