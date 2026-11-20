import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

import PrimeiraExecucao from '../app/primeira-execucao';
import * as nativo from '../modules/protecao-android';
import { proximaPendente } from '../src/estadoPermissoes';

const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));
jest.mock('../modules/protecao-android', () => ({
  ehTelaInicialPadrao: jest.fn(),
  temPapelTriagem: jest.fn(),
  podeAvisar: jest.fn(),
  abrirEscolhaTelaInicial: jest.fn(),
  pedirPapelTriagem: jest.fn(),
}));

const mock = (f: unknown) => f as jest.Mock;
const todos = { telaInicial: true, triagem: true, avisar: true, encerrar: true };

function definir(e: typeof todos) {
  mock(nativo.ehTelaInicialPadrao).mockReturnValue(e.telaInicial);
  mock(nativo.temPapelTriagem).mockReturnValue(e.triagem);
  mock(nativo.podeAvisar).mockReturnValue(e.avisar);
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(e.encerrar);
}

beforeEach(() => {
  jest.clearAllMocks();
  definir(todos);
});

describe('proximaPendente', () => {
  it('segue a ordem tela inicial, triagem, avisar, encerrar', () => {
    expect(proximaPendente({ telaInicial: false, triagem: false, avisar: false, encerrar: false })).toBe('telaInicial');
    expect(proximaPendente({ ...todos, triagem: false, avisar: false, encerrar: false })).toBe('triagem');
    expect(proximaPendente({ ...todos, avisar: false, encerrar: false })).toBe('avisar');
    expect(proximaPendente({ ...todos, encerrar: false })).toBe('encerrar');
    expect(proximaPendente(todos)).toBeNull();
  });
});

describe('primeira execução', () => {
  it.each([
    ['telaInicial', 'Usar como tela inicial'],
    ['triagem', 'Ativar aviso de golpe'],
    ['avisar', 'Permitir avisos'],
    ['encerrar', 'Permitir desligar golpista'],
  ] as const)('passo %s mostra o botão "%s"', async (passo, botao) => {
    definir({ ...todos, [passo]: false });
    await render(<PrimeiraExecucao />);
    expect(await screen.findByText(botao)).toBeTruthy();
  });

  it('com tudo concedido, vai para /inicio', async () => {
    await render(<PrimeiraExecucao />);
    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/inicio'));
  });

  it('tela inicial: abre a escolha de tela inicial', async () => {
    definir({ ...todos, telaInicial: false });
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Usar como tela inicial'));
    expect(nativo.abrirEscolhaTelaInicial).toHaveBeenCalled();
  });

  it('triagem: pede o papel de triagem', async () => {
    definir({ ...todos, triagem: false });
    mock(nativo.pedirPapelTriagem).mockResolvedValue(true);
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(nativo.pedirPapelTriagem).toHaveBeenCalled();
  });

  it('avisar: pede POST_NOTIFICATIONS no Android 13+ e abre configurações se ainda não pode avisar', async () => {
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(34);
    definir({ ...todos, avisar: false });
    const pedir = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir avisos'));
    expect(pedir).toHaveBeenCalledWith('android.permission.POST_NOTIFICATIONS');
    expect(abrir).toHaveBeenCalled();
  });

  it('avisar: não abre configurações quando passou a poder avisar', async () => {
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(34);
    definir({ ...todos, avisar: false });
    jest.spyOn(PermissionsAndroid, 'request').mockImplementation(async () => {
      mock(nativo.podeAvisar).mockReturnValue(true);
      return 'granted';
    });
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir avisos'));
    expect(abrir).not.toHaveBeenCalled();
  });

  it('encerrar: pede ANSWER_PHONE_CALLS', async () => {
    definir({ ...todos, encerrar: false });
    const pedir = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir desligar golpista'));
    expect(pedir).toHaveBeenCalledWith('android.permission.ANSWER_PHONE_CALLS');
  });

  it('relê as permissões ao voltar ao app e avança o passo', async () => {
    let aoMudar: (estado: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, f) => {
      aoMudar = f as typeof aoMudar;
      return { remove: jest.fn() };
    });
    definir({ ...todos, telaInicial: false });
    await render(<PrimeiraExecucao />);
    await screen.findByText('Usar como tela inicial');
    definir({ ...todos, triagem: false });
    await act(async () => aoMudar('active'));
    expect(await screen.findByText('Ativar aviso de golpe')).toBeTruthy();
  });
});
