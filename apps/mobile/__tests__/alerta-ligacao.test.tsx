import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import AlertaLigacao from '../app/alerta-ligacao';
import { encerrarChamada } from '../modules/protecao-android';

jest.mock('../modules/protecao-android', () => ({ encerrarChamada: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Warning: 'warning' },
}));
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

const encerrar = encerrarChamada as jest.Mock;
const replace = router.replace as jest.Mock;
const params = useLocalSearchParams as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  encerrar.mockReturnValue(true);
  params.mockReturnValue({ numero: '+5511900000001', tipo: 'falso_banco' });
});

describe('tela de alerta da ligação', () => {
  it('mostra o aviso, o número formatado e o tipo de golpe', async () => {
    await render(<AlertaLigacao />);
    expect(screen.getByText(/Cuidado!/)).toBeTruthy();
    expect(screen.getByText('(11) 90000-0001')).toBeTruthy();
    expect(screen.getByText(/Finge ser do banco/)).toBeTruthy();
  });

  it('usa "outro" quando o tipo é desconhecido ou falta', async () => {
    params.mockReturnValue({ numero: '+5511900000001', tipo: 'inventado' });
    await render(<AlertaLigacao />);
    expect(screen.getByText(/Esse número já foi denunciado/)).toBeTruthy();
  });

  it('vibra um aviso ao abrir', async () => {
    await render(<AlertaLigacao />);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('põe "Não atender" antes de "Atender mesmo assim"', async () => {
    await render(<AlertaLigacao />);
    const botoes = screen.getAllByRole('button');
    expect(botoes).toHaveLength(2);
    expect(botoes[0]).toHaveTextContent('Não atender');
    expect(botoes[1]).toHaveTextContent('Atender mesmo assim');
  });

  it('"Não atender" encerra a chamada e vai para o início', async () => {
    await render(<AlertaLigacao />);
    await fireEvent.press(screen.getByText('Não atender'));
    expect(encerrar).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/inicio');
    expect(encerrar.mock.invocationCallOrder[0]).toBeLessThan(replace.mock.invocationCallOrder[0]);
  });

  it('fecha mesmo quando encerrar devolve false', async () => {
    encerrar.mockReturnValue(false);
    await render(<AlertaLigacao />);
    await fireEvent.press(screen.getByText('Não atender'));
    expect(replace).toHaveBeenCalledWith('/inicio');
  });

  it('fecha mesmo quando encerrar lança erro', async () => {
    encerrar.mockImplementation(() => {
      throw new Error('falhou');
    });
    await render(<AlertaLigacao />);
    await fireEvent.press(screen.getByText('Não atender'));
    expect(replace).toHaveBeenCalledWith('/inicio');
  });

  it('"Atender mesmo assim" não encerra e vai para o início', async () => {
    await render(<AlertaLigacao />);
    await fireEvent.press(screen.getByText('Atender mesmo assim'));
    expect(encerrar).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/inicio');
  });
});
