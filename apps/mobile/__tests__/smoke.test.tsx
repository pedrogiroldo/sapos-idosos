import { render, screen } from '@testing-library/react-native';
import { PermissionsAndroid } from 'react-native';

import Inicio from '../app/inicio';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Redirect: () => null,
}));
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn() }));
jest.mock('../modules/protecao-android', () => ({
  ehTelaInicialPadrao: () => true,
  temPapelTriagem: () => true,
  podeAvisar: () => true,
  abrirEscolhaTelaInicial: jest.fn(),
  pedirPapelTriagem: jest.fn(),
}));

describe('tela inicial', () => {
  it('mostra o botão "Isso é golpe?"', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
    await render(<Inicio />);
    expect(await screen.findByText('Isso é golpe?')).toBeTruthy();
  });
});
