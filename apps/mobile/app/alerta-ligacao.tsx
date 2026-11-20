import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { encerrarChamada } from '../modules/protecao-android';
import { descreverTipo, ehTipoGolpe, formatarTelefone } from '../src/textos';
import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

// Cor opaca do botão secundário: branco a 16% sobre dangerDeep (sem transparência no modo protegido).
const BOTAO_SECUNDARIO = '#8f3138';

export default function AlertaLigacao() {
  const tema = useTema();
  const { numero, tipo } = useLocalSearchParams<{ numero?: string; tipo?: string }>();
  const tipoGolpe = ehTipoGolpe(tipo) ? tipo : 'outro';
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.timing(opacidade, { toValue: 1, duration: 250, useNativeDriver: false }).start();
  }, [opacidade]);

  const naoAtender = () => {
    try {
      encerrarChamada();
    } catch {
      // Se não deu para encerrar, a tela fecha mesmo assim e a chamada segue tocando.
    }
    router.replace('/inicio');
  };

  const atenderMesmoAssim = () => router.replace('/inicio');

  return (
    <Animated.View style={[styles.tela, { backgroundColor: tema.dangerDeep, opacity: opacidade }]}>
      <View style={styles.topo}>
        <Text style={[type.pAlert, styles.centro, { color: tema.onDangerDeep }]}>
          Cuidado!{'\n'}Pode ser golpe
        </Text>
        {numero ? (
          <Text style={[type.pBody, styles.centro, { color: tema.onDangerDeepMuted }]}>
            {formatarTelefone(numero)}
          </Text>
        ) : null}
      </View>

      <View style={[styles.cartao, { backgroundColor: tema.alarmCard }]}>
        <Text style={[type.pBody, { color: tema.alarmCardInk }]}>
          {descreverTipo(tipoGolpe)}
        </Text>
        <Text style={[type.pBody, { color: tema.alarmCardInk }]}>
          Não passe senha, código nem Pix para quem ligou.
        </Text>
      </View>

      <View style={styles.botoes}>
        <Pressable
          accessibilityRole="button"
          onPress={naoAtender}
          style={[styles.botao, styles.botaoPrincipal, { backgroundColor: tema.onDangerDeep }]}
        >
          <Text style={[type.pAction, styles.textoPrincipal, { color: tema.danger }]}>
            Não atender
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={atenderMesmoAssim}
          style={[styles.botao, { backgroundColor: BOTAO_SECUNDARIO }]}
        >
          <Text style={[type.pAction, { color: tema.onDangerDeep }]}>Atender mesmo assim</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    paddingHorizontal: space[5],
    paddingTop: space[12],
    paddingBottom: space[8],
    gap: space[5],
  },
  topo: { alignItems: 'center', gap: space[3] },
  centro: { textAlign: 'center' },
  cartao: { borderRadius: radius.lg, padding: space[5], gap: space[3] },
  botoes: { marginTop: 'auto', gap: space[3] },
  botao: {
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipal: { minHeight: size.targetProtectedMax },
  textoPrincipal: { fontSize: 22 },
});
