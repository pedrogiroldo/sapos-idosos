import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { atalhos, type AtalhoId } from '../src/atalhos';
import { proximaPendente, usePermissoes } from '../src/estadoPermissoes';
import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

const ICONES: Record<AtalhoId, string> = { ligar: '📞', whatsapp: '💬', camera: '📷', fotos: '🖼️' };
const COR_ICONE: Record<AtalhoId, 'safe' | 'brand'> = {
  ligar: 'safe',
  whatsapp: 'safe',
  camera: 'brand',
  fotos: 'brand',
};

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function useAgora() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

export default function Inicio() {
  const tema = useTema();
  const { estado } = usePermissoes();
  const agora = useAgora();

  // Tela inicial do celular: "voltar" não sai do app.
  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => assinatura.remove();
  }, []);

  if (!estado) return <View style={[styles.tela, { backgroundColor: tema.surfacePage }]} />;
  if (proximaPendente(estado)) return <Redirect href="/primeira-execucao" />;

  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = maiuscula(
    agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
  );

  return (
    <View style={[styles.tela, { backgroundColor: tema.surfacePage }]}>
      <View style={styles.cabecalho}>
        <Pressable onLongPress={() => router.push('/demo')} delayLongPress={1000}>
          <Text style={[type.pClock, { color: tema.ink }]}>{hora}</Text>
        </Pressable>
        <Text style={[type.pBody, { color: tema.inkMuted }]}>{data}</Text>
        <View style={[styles.selo, { backgroundColor: tema.safeSoft }]}>
          <Text style={[type.fSmall, styles.seloTexto, { color: tema.safeInk }]}>Protegida</Text>
        </View>
      </View>

      <View style={styles.grade}>
        {atalhos.map((atalho) => (
          <Pressable
            key={atalho.id}
            accessibilityRole="button"
            onPress={() => atalho.abrir().catch(() => undefined)}
            style={[styles.tile, { backgroundColor: tema.surfaceCard }]}
          >
            <View style={[styles.icone, { backgroundColor: tema[COR_ICONE[atalho.id]] }]}>
              <Text style={styles.emoji}>{ICONES[atalho.id]}</Text>
            </View>
            <Text style={[type.pAction, { color: tema.ink }]}>{atalho.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/golpe' as never)}
        style={[styles.botao, { backgroundColor: tema.brand }]}
      >
        <Text style={[type.pAction, { color: tema.onBrand }]}>Isso é golpe?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, padding: space[5], paddingTop: space[12], paddingBottom: space[8], gap: space[5] },
  cabecalho: { gap: space[1] },
  selo: {
    alignSelf: 'flex-start',
    marginTop: space[2],
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  seloTexto: { fontWeight: '600' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  tile: {
    width: '48%',
    flexGrow: 1,
    height: size.tileHeight,
    borderRadius: radius.xl,
    padding: space[4],
    justifyContent: 'space-between',
  },
  icone: {
    width: size.iconTile,
    height: size.iconTile,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  botao: {
    marginTop: 'auto',
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
