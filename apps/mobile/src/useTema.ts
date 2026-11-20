import { useColorScheme } from 'react-native';

import { colors } from './theme';

// Mesmas chaves de colors.light, com valores como string (claro e escuro têm cores diferentes).
export type Tema = { [K in keyof typeof colors.light]: string };

export function useTema(): Tema {
  return useColorScheme() === 'dark' ? colors.dark : colors.light;
}
