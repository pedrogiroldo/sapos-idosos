import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

export default function Inicio() {
  const tema = useTema();

  return (
    <View style={[styles.tela, { backgroundColor: tema.surfacePage }]}>
      <Pressable
        accessibilityRole="button"
        style={[styles.botao, { backgroundColor: tema.brand }]}
      >
        <Text style={[type.pAction, { color: tema.onBrand }]}>Isso é golpe?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: space[5],
  },
  botao: {
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
