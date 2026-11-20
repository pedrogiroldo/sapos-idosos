import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { executarPasso, proximaPendente, usePermissoes, type Passo } from '../src/estadoPermissoes';
import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

const PASSOS: Record<Passo, { frase: string; botao: string }> = {
  telaInicial: {
    frase: 'Este app vai ser a tela do seu celular. Toque no botão e escolha "App família".',
    botao: 'Usar como tela inicial',
  },
  triagem: {
    frase: 'Para avisar quando uma ligação for golpe, precisamos da sua permissão.',
    botao: 'Ativar aviso de golpe',
  },
  avisar: {
    frase: 'Para mostrar o aviso na tela quando o telefone tocar, permita os avisos.',
    botao: 'Permitir avisos',
  },
  encerrar: {
    frase: 'Assim você pode desligar o golpista com um toque.',
    botao: 'Permitir desligar golpista',
  },
};

export default function PrimeiraExecucao() {
  const tema = useTema();
  const { estado, reler } = usePermissoes();

  if (!estado) return <View style={[styles.tela, { backgroundColor: tema.surfacePage }]} />;
  const passo = proximaPendente(estado);
  if (!passo) return <Redirect href="/inicio" />;

  const { frase, botao } = PASSOS[passo];
  const avancar = async () => {
    await executarPasso(passo);
    await reler();
  };

  return (
    <View style={[styles.tela, { backgroundColor: tema.surfacePage }]}>
      <View style={styles.texto}>
        <Text style={[type.pAlert, { color: tema.ink }]}>Vamos proteger seu celular</Text>
        <Text style={[type.pBody, { color: tema.ink }]}>{frase}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={avancar}
        style={[styles.botao, { backgroundColor: tema.brand }]}
      >
        <Text style={[type.pAction, { color: tema.onBrand }]}>{botao}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, padding: space[5], paddingTop: space[12], paddingBottom: space[8] },
  texto: { gap: space[4] },
  botao: {
    marginTop: 'auto',
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
