import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as IntentLauncher from 'expo-intent-launcher';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

import PrimeiraExecucao from '../app/primeira-execucao';
import * as nativo from '../modules/protecao-android';
import { proximaPendente, reiniciarEstadoDaExecucao } from '../src/estadoPermissoes';

const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn() }));
jest.mock('../modules/protecao-android', () => ({
  ehTelaInicialPadrao: jest.fn(),
  temPapelTriagem: jest.fn(),
  podeAvisar: jest.fn(),
  podeUsarTelaCheia: jest.fn(),
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

const abrirIntent = IntentLauncher.startActivityAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  reiniciarEstadoDaExecucao();
  definir(todos);
  mock(nativo.podeUsarTelaCheia).mockReturnValue(true);
  abrirIntent.mockReset().mockResolvedValue({ resultCode: 0 });
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

  it('"Fazer isso depois" vai para /inicio', async () => {
    definir({ ...todos, triagem: false });
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Fazer isso depois'));
    expect(router.replace).toHaveBeenCalledWith('/inicio');
  });

  it.each(['denied', 'never_ask_again'] as const)(
    'encerrar: resultado "%s" abre as configurações',
    async (resultado) => {
      definir({ ...todos, encerrar: false });
      jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(resultado);
      const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
      await render(<PrimeiraExecucao />);
      await fireEvent.press(await screen.findByText('Permitir desligar golpista'));
      expect(abrir).toHaveBeenCalled();
    },
  );

  it('encerrar: concedido não abre as configurações', async () => {
    definir({ ...todos, encerrar: false });
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir desligar golpista'));
    expect(abrir).not.toHaveBeenCalled();
  });

  it('triagem: negado uma vez, o toque seguinte pede de novo', async () => {
    definir({ ...todos, triagem: false });
    mock(nativo.pedirPapelTriagem).mockResolvedValue(false);
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(nativo.pedirPapelTriagem).toHaveBeenCalledTimes(1);
    expect(abrirIntent).not.toHaveBeenCalled();
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(nativo.pedirPapelTriagem).toHaveBeenCalledTimes(2);
    expect(abrir).not.toHaveBeenCalled();
  });

  it('triagem: negado duas vezes, abre os apps padrão e não pede mais', async () => {
    definir({ ...todos, triagem: false });
    mock(nativo.pedirPapelTriagem).mockResolvedValue(false);
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(abrirIntent).toHaveBeenCalledWith('android.settings.MANAGE_DEFAULT_APPS_SETTINGS');
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(nativo.pedirPapelTriagem).toHaveBeenCalledTimes(2);
    expect(abrirIntent).toHaveBeenCalledTimes(2);
  });

  it('triagem: sem a tela de apps padrão, abre as configurações do app', async () => {
    definir({ ...todos, triagem: false });
    mock(nativo.pedirPapelTriagem).mockResolvedValue(false);
    abrirIntent.mockRejectedValue(new Error('sem activity'));
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    await fireEvent.press(await screen.findByText('Ativar aviso de golpe'));
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it('avisar: Android 14+ com notificações ligadas e sem tela cheia abre a permissão de tela cheia', async () => {
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(34);
    definir({ ...todos, avisar: false });
    mock(nativo.podeUsarTelaCheia).mockReturnValue(false);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir avisos'));
    expect(abrirIntent).toHaveBeenCalledWith('android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT', {
      data: 'package:com.saposidosos.app',
    });
    expect(abrir).not.toHaveBeenCalled();
  });

  it('avisar: notificações negadas abre as configurações do app, não a de tela cheia', async () => {
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(34);
    definir({ ...todos, avisar: false });
    mock(nativo.podeUsarTelaCheia).mockReturnValue(false);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('denied');
    const abrir = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render(<PrimeiraExecucao />);
    await fireEvent.press(await screen.findByText('Permitir avisos'));
    expect(abrirIntent).not.toHaveBeenCalled();
    expect(abrir).toHaveBeenCalled();
  });

  it('se a leitura nativa falhar, mostra o primeiro passo em vez de tela vazia', async () => {
    mock(nativo.temPapelTriagem).mockImplementation(() => {
      throw new Error('módulo indisponível');
    });
    await render(<PrimeiraExecucao />);
    expect(await screen.findByText('Usar como tela inicial')).toBeTruthy();
  });
});
