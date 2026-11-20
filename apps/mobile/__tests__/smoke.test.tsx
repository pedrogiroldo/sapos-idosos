import { render, screen } from '@testing-library/react-native';

import Inicio from '../app/inicio';

describe('tela inicial', () => {
  it('mostra o botão "Isso é golpe?"', async () => {
    await render(<Inicio />);
    expect(screen.getByText('Isso é golpe?')).toBeTruthy();
  });
});
