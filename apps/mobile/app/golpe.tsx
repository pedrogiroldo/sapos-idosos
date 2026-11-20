import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

// Provisória: a checagem de mensagens chega num próximo marco.
export default function Golpe() {
  const tema = useTema();
  return (
    <View style={[styles.tela, { backgroundColor: tema.surfacePage }]}>
      <View style={styles.texto}>
        <Text style={[type.pAlert, { color: tema.ink }]}>Isso é golpe?</Text>
        <Text style={[type.pBody, { color: tema.ink }]}>
          Em breve você vai poder colar a mensagem aqui.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/inicio')}
        style={[styles.botao, { backgroundColor: tema.brand }]}
      >
        <Text style={[type.pAction, { color: tema.onBrand }]}>Voltar ao início</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, padding: space[5], paddingTop: space[12], paddingBottom: space[8] },
  texto: { gap: space[4], marginBottom: 'auto' },
  botao: {
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
