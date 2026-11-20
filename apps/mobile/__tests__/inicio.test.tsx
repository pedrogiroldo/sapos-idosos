import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AppState, BackHandler, Linking, PermissionsAndroid } from 'react-native';

import Inicio from '../app/inicio';
import { atalhos } from '../src/atalhos';
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

  it('com permissão pendente, redireciona para a primeira execução', async () => {
    tudoConcedido(false);
    await render(<Inicio />);
    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/primeira-execucao'));
    expect(screen.queryByText('Isso é golpe?')).toBeNull();
  });

  it('relê as permissões quando o app volta ao primeiro plano', async () => {
    let aoMudar: (estado: string) => void = () => undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, f) => {
      aoMudar = f as typeof aoMudar;
      return { remove: jest.fn() };
    });
    await render(<Inicio />);
    await screen.findByText('Isso é golpe?');
    tudoConcedido(false);
    await act(async () => aoMudar('active'));
    await waitFor(() => expect(mockRedirect).toHaveBeenCalledWith('/primeira-execucao'));
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
