import { Redirect, router } from 'expo-router';
import { Camera, Image as Foto, MessageCircle, Phone, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { atalhos, type AtalhoId } from '../src/atalhos';
import { consumirPrimeiraVisita, proximaPendente, usePermissoes } from '../src/estadoPermissoes';
import { radius, size, space, type } from '../src/theme';
import { useTema } from '../src/useTema';

const ICONES: Record<AtalhoId, typeof Phone> = {
  ligar: Phone,
  whatsapp: MessageCircle,
  camera: Camera,
  fotos: Foto,
};
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
    // Primeira batida no começo do próximo minuto, depois a cada 60s.
    let intervalo: ReturnType<typeof setInterval> | undefined;
    const atualizar = () => setAgora(new Date());
    const espera = 60_000 - (Date.now() % 60_000);
    const inicio = setTimeout(() => {
      atualizar();
      intervalo = setInterval(atualizar, 60_000);
    }, espera);
    return () => {
      clearTimeout(inicio);
      if (intervalo) clearInterval(intervalo);
    };
  }, []);
  return agora;
}

export default function Inicio() {
  const tema = useTema();
  const { estado } = usePermissoes();
  const agora = useAgora();
  const redirecionar = useRef<boolean | null>(null);

  // Tela inicial do celular: "voltar" não sai do app.
  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => assinatura.remove();
  }, []);

  if (!estado) return <View style={[styles.tela, { backgroundColor: tema.surfacePage }]} />;
  const pendente = proximaPendente(estado) !== null;
  if (redirecionar.current === null) redirecionar.current = consumirPrimeiraVisita() && pendente;
  if (redirecionar.current && pendente) return <Redirect href="/primeira-execucao" />;

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
          <ShieldCheck size={20} color={tema.safeInk} strokeWidth={2.2} />
          <Text style={[type.pLabel, { color: tema.safeInk }]}>Protegida</Text>
        </View>
      </View>

      {pendente ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/primeira-execucao')}
          style={[styles.aviso, { backgroundColor: tema.cautionSoft }]}
        >
          <Text style={[type.pLabel, { color: tema.cautionInk }]}>Falta ativar a proteção</Text>
        </Pressable>
      ) : null}

      <View style={styles.grade}>
        {atalhos.map((atalho) => {
          const Icone = ICONES[atalho.id];
          return (
            <Pressable
              key={atalho.id}
              accessibilityRole="button"
              onPress={() => atalho.abrir().catch(() => undefined)}
              style={[styles.tile, { backgroundColor: tema.surfaceCard }]}
            >
              <View style={[styles.icone, { backgroundColor: tema[COR_ICONE[atalho.id]] }]}>
                <Icone size={30} color={tema.onBrand} strokeWidth={2.2} />
              </View>
              <Text style={[type.pAction, { color: tema.ink }]}>{atalho.rotulo}</Text>
            </Pressable>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: space[2],
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 14,
  },
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
  aviso: {
    minHeight: size.targetProtected,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    justifyContent: 'center',
  },
  botao: {
    marginTop: 'auto',
    minHeight: size.targetProtected,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
