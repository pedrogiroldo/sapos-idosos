import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AppState, BackHandler, Linking, PermissionsAndroid, StyleSheet } from 'react-native';

import Inicio from '../app/inicio';
import { atalhos } from '../src/atalhos';
import { reiniciarEstadoDaExecucao } from '../src/estadoPermissoes';
import * as nativo from '../modules/protecao-android';

const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
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
  abrirEscolhaTelaInicial: jest.fn(),
  pedirPapelTriagem: jest.fn(),
}));

const mock = (f: unknown) => f as jest.Mock;

function tudoConcedido(concedido: boolean) {
  mock(nativo.ehTelaInicialPadrao).mockReturnValue(concedido);
  mock(nativo.temPapelTriagem).mockReturnValue(concedido);
  mock(nativo.podeAvisar).mockReturnValue(concedido);
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(concedido);
}

beforeEach(() => {
  jest.clearAllMocks();
  reiniciarEstadoDaExecucao();
  jest.useFakeTimers({ now: new Date(2026, 10, 19, 14, 30), advanceTimers: true });
  tudoConcedido(true);
});
afterEach(() => jest.useRealTimers());

describe('tela inicial', () => {
  it('mostra relógio, data, selo, os 4 atalhos e "Isso é golpe?"', async () => {
    await render(<Inicio />);
    expect(await screen.findByText('14:30')).toBeTruthy();
    expect(screen.getByText('Quinta-feira, 19 de novembro')).toBeTruthy();
    expect(screen.getByText('Protegida')).toBeTruthy();
    for (const rotulo of ['Ligar', 'WhatsApp', 'Câmera', 'Fotos']) {
      expect(screen.getByText(rotulo)).toBeTruthy();
    }
    expect(screen.getByText('Isso é golpe?')).toBeTruthy();
  });

  it('atualiza o relógio a cada minuto', async () => {
    await render(<Inicio />);
    await screen.findByText('14:30');
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('14:31')).toBeTruthy();
  });

  it('alinha a primeira batida ao próximo minuto', async () => {
    jest.setSystemTime(new Date(2026, 10, 19, 14, 30, 45));
    await render(<Inicio />);
    await screen.findByText('14:30');
    await act(async () => {
      jest.advanceTimersByTime(14_000);
    });
    expect(screen.getByText('14:30')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.getByText('14:31')).toBeTruthy();
  });

  it('"voltar" não sai: o handler registrado devolve true', async () => {
    const add = jest.spyOn(BackHandler, 'addEventListener');
    await render(<Inicio />);
    await screen.findByText('14:30');
    const chamada = add.mock.calls.find(([evento]) => evento === 'hardwareBackPress');
    expect((chamada![1] as () => boolean)()).toBe(true);
  });

  it('toque longo no relógio abre o painel de demo', async () => {
    await render(<Inicio />);
    await fireEvent(await screen.findByText('14:30'), 'longPress');
    expect(router.push).toHaveBeenCalledWith('/demo');
  });

  it('"Isso é golpe?" vai para /golpe', async () => {
    await render(<Inicio />);
    await fireEvent.press(await screen.findByText('Isso é golpe?'));
    expect(router.push).toHaveBeenCalledWith('/golpe');
  });

  it('toque no atalho abre o app correspondente', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    await render(<Inicio />);
    await fireEvent.press(await screen.findByText('Ligar'));
    expect(abrir).toHaveBeenCalledWith('tel:');
  });

  it('com permissão pendente, redireciona só na primeira visita da execução', async () => {
    tudoConcedido(false);
    const primeira = await render(<Inicio />);
    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/primeira-execucao'));
    expect(screen.queryByText('Isso é golpe?')).toBeNull();

    mockRedirect.mockClear();
    await primeira.unmount();
    await render(<Inicio />);
    expect(await screen.findByText('Isso é golpe?')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('depois da primeira visita, mostra o aviso "Falta ativar a proteção" que abre a configuração', async () => {
    tudoConcedido(true);
    const primeira = await render(<Inicio />);
    await screen.findByText('Isso é golpe?');
    expect(screen.queryByText('Falta ativar a proteção')).toBeNull();
    await primeira.unmount();

    tudoConcedido(false);
    await render(<Inicio />);
    const aviso = await screen.findByRole('button', { name: 'Falta ativar a proteção' });
    expect(StyleSheet.flatten(aviso.props.style).minHeight).toBeGreaterThanOrEqual(64);
    await fireEvent.press(aviso);
    expect(router.push).toHaveBeenCalledWith('/primeira-execucao');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('relê as permissões ao voltar ao app e mostra o aviso, sem redirecionar', async () => {
    let aoMudar: (estado: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, f) => {
      aoMudar = f as typeof aoMudar;
      return { remove: jest.fn() };
    });
    await render(<Inicio />);
    await screen.findByText('Isso é golpe?');
    tudoConcedido(false);
    await act(async () => aoMudar('active'));
    expect(await screen.findByText('Falta ativar a proteção')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe('atalhos', () => {
  const abrirAtalho = (id: string) => atalhos.find((a) => a.id === id)!.abrir();

  it('WhatsApp abre o app quando instalado', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    await abrirAtalho('whatsapp');
    expect(abrir).toHaveBeenCalledWith('whatsapp://send');
  });

  it('WhatsApp abre a Play Store quando não instalado', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue();
    await abrirAtalho('whatsapp');
    expect(abrir).toHaveBeenCalledWith('market://details?id=com.whatsapp');
  });

  it('Câmera e Fotos usam intents', async () => {
    const { startActivityAsync } = jest.requireMock('expo-intent-launcher');
    await abrirAtalho('camera');
    expect(startActivityAsync).toHaveBeenCalledWith('android.media.action.STILL_IMAGE_CAMERA');
    await abrirAtalho('fotos');
    expect(startActivityAsync).toHaveBeenCalledWith('android.intent.action.MAIN', {
      category: 'android.intent.category.APP_GALLERY',
    });
  });
});
