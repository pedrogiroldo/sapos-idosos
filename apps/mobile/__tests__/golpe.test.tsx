import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import Golpe from '../app/golpe';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe('tela "Isso é golpe?"', () => {
  it('mostra o título e o aviso de que vem em breve', async () => {
    await render(<Golpe />);
    expect(screen.getByText('Isso é golpe?')).toBeTruthy();
    expect(screen.getByText('Em breve você vai poder colar a mensagem aqui.')).toBeTruthy();
  });

  it('usa texto de pelo menos 17px', async () => {
    await render(<Golpe />);
    for (const texto of ['Isso é golpe?', 'Em breve você vai poder colar a mensagem aqui.', 'Voltar ao início']) {
      expect(StyleSheet.flatten(screen.getByText(texto).props.style).fontSize).toBeGreaterThanOrEqual(17);
    }
  });

  it('"Voltar ao início" tem 64px e volta para /inicio', async () => {
    await render(<Golpe />);
    const botao = screen.getByRole('button', { name: 'Voltar ao início' });
    expect(StyleSheet.flatten(botao.props.style).minHeight).toBeGreaterThanOrEqual(64);
    await fireEvent.press(botao);
    expect(router.replace).toHaveBeenCalledWith('/inicio');
  });
});
