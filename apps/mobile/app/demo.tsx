import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  adicionarNumeroTeste,
  definirRegra,
  regra as lerRegra,
  totalNumeros,
  versaoBase,
  type Regra,
} from '../modules/protecao-android';
import { usePermissoes } from '../src/estadoPermissoes';
import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

const simNao = (v: boolean) => (v ? 'sim' : 'não');

export default function Demo() {
  const tema = useTema();
  const { estado } = usePermissoes();
  const [regra, setRegra] = useState<Regra>(() => lerRegra());
  const [total, setTotal] = useState(() => totalNumeros());
  const [numero, setNumero] = useState('');

  const outraRegra: Regra = regra === 'avisar' ? 'bloquear' : 'avisar';
  const trocarRegra = () => {
    definirRegra(outraRegra);
    setRegra(outraRegra);
  };
  const adicionar = () => {
    if (!numero.trim()) return;
    adicionarNumeroTeste(numero.trim(), 'falso_banco');
    setTotal(totalNumeros());
    setNumero('');
  };

  const linhas = [
    `Versão da base: ${versaoBase()}`,
    `Números na base: ${total}`,
    ...(estado
      ? [
          `Tela inicial: ${simNao(estado.telaInicial)}`,
          `Triagem de chamadas: ${simNao(estado.triagem)}`,
          `Avisos: ${simNao(estado.avisar)}`,
          `Desligar chamada: ${simNao(estado.encerrar)}`,
        ]
      : []),
  ];

  return (
    <ScrollView
      style={{ backgroundColor: tema.surfacePage }}
      contentContainerStyle={styles.conteudo}
      bounces={false}
      overScrollMode="never"
    >
      <Text style={[type.fTitle, { color: tema.ink }]}>Painel de demonstração</Text>
      {linhas.map((l) => (
        <Text key={l} style={[type.fBody, { color: tema.ink }]}>
          {l}
        </Text>
      ))}

      <Text style={[type.fBody, { color: tema.ink }]}>{`Regra: ${regra}`}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={trocarRegra}
        style={[styles.botao, { backgroundColor: tema.brandSoft }]}
      >
        <Text style={[type.pAction, { color: tema.brandInk }]}>{`Trocar para ${outraRegra}`}</Text>
      </Pressable>

      <View style={styles.campo}>
        <TextInput
          value={numero}
          onChangeText={setNumero}
          placeholder="Número de teste"
          placeholderTextColor={tema.inkMuted}
          keyboardType="phone-pad"
          style={[type.fBody, styles.input, { color: tema.ink, backgroundColor: tema.surfaceCard }]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={adicionar}
          style={[styles.botao, { backgroundColor: tema.brand }]}
        >
          <Text style={[type.pAction, { color: tema.onBrand }]}>Adicionar</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/inicio')}
        style={[styles.botao, { backgroundColor: tema.fill }]}
      >
        <Text style={[type.pAction, { color: tema.ink }]}>Voltar ao início</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: space[5], paddingTop: space[12], paddingBottom: space[8], gap: space[3] },
  campo: { gap: space[3] },
  input: { minHeight: size.targetMin, borderRadius: radius.md, paddingHorizontal: space[4] },
  botao: {
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
