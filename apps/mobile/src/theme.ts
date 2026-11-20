// Gerado a partir de tokens.json do design system "App família" (v2, estilo Apple). Não edite à mão.
import { Platform } from 'react-native';

export const colors = {
  light: {
    surfacePage: '#f2f2f7',
    surfaceCard: '#ffffff',
    surfaceRaised: '#ffffff',
    fill: '#e9e9eb',
    line: '#c6c6c8',
    lineStrong: '#8a8a8e',
    ink: '#000000',
    inkMuted: '#636366',
    brand: '#4b3fc7',
    onBrand: '#ffffff',
    brandInk: '#4b3fc7',
    brandSoft: '#ecebff',
    safe: '#1f7a37',
    onSafe: '#ffffff',
    safeSoft: '#e3f5e8',
    safeInk: '#14532d',
    caution: '#c93400',
    cautionSoft: '#fff1e0',
    cautionInk: '#8a2b00',
    danger: '#d70015',
    onDanger: '#ffffff',
    dangerSoft: '#ffe9ea',
    dangerInk: '#6e0a12',
    dangerDeep: '#7a0a12',
    onDangerDeep: '#ffffff',
    onDangerDeepMuted: '#ffc9cc',
    alarmCard: '#ffffff',
    alarmCardInk: '#000000',
    avatarBlue: '#d9e6ff',
    avatarBlueInk: '#0b3a8c',
    avatarAmber: '#ffe8c7',
    avatarAmberInk: '#7a3a00',
    avatarGreen: '#d7f2df',
    avatarGreenInk: '#14532d',
    materialBar: 'rgba(249, 249, 249, 0.78)',
    materialThick: 'rgba(255, 255, 255, 0.9)',
    scrim: 'rgba(0, 0, 0, 0.35)',
  },
  dark: {
    surfacePage: '#000000',
    surfaceCard: '#1c1c1e',
    surfaceRaised: '#2c2c2e',
    fill: '#2c2c2e',
    line: '#38383a',
    lineStrong: '#8a8a8e',
    ink: '#ffffff',
    inkMuted: '#98989f',
    brand: '#5a4fd8',
    onBrand: '#ffffff',
    brandInk: '#a49bff',
    brandSoft: '#1f1a4d',
    safe: '#30d158',
    onSafe: '#000000',
    safeSoft: '#0e2a17',
    safeInk: '#7ee2a0',
    caution: '#ffb340',
    cautionSoft: '#33200a',
    cautionInk: '#ffd08a',
    danger: '#ff6961',
    onDanger: '#000000',
    dangerSoft: '#3a0f12',
    dangerInk: '#ffc9cc',
    dangerDeep: '#7a0a12',
    onDangerDeep: '#ffffff',
    onDangerDeepMuted: '#ffc9cc',
    alarmCard: '#ffffff',
    alarmCardInk: '#000000',
    avatarBlue: '#1e3460',
    avatarBlueInk: '#c2d6ff',
    avatarAmber: '#3d2a0c',
    avatarAmberInk: '#ffd99a',
    avatarGreen: '#123620',
    avatarGreenInk: '#9be8b4',
    materialBar: 'rgba(28, 28, 30, 0.72)',
    materialThick: 'rgba(44, 44, 46, 0.88)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export const space = {1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48} as const;
export const radius = {sm: 10, md: 14, lg: 22, xl: 28, full: 999} as const;
export const size = {targetMin: 48, targetFamily: 50, targetCompact: 36, targetProtected: 64, targetProtectedMax: 72, tileHeight: 120, avatarLg: 72, avatarMd: 44, iconTile: 52, iconAction: 24, iconUi: 22, grabber: 36} as const;

// Fonte do sistema: SF Pro no iPhone, Roboto no Android. fontFamily indefinido = fonte do sistema.
const rounded = Platform.select({ ios: 'ui-rounded', default: undefined });
const w = (n: number) => String(n) as '400' | '600' | '700';

export const type = {
  pClock: { fontFamily: rounded, fontSize: 76, lineHeight: 76, fontWeight: w(600), letterSpacing: -2.28 },
  pAlert: { fontSize: 40, lineHeight: 42, fontWeight: w(700), letterSpacing: -1.0 },
  pVerdict: { fontSize: 34, lineHeight: 40, fontWeight: w(700), letterSpacing: -0.68 },
  pAction: { fontSize: 20, lineHeight: 25, fontWeight: w(600), letterSpacing: -0.2 },
  pBody: { fontSize: 20, lineHeight: 28, fontWeight: w(400), letterSpacing: 0 },
  pLabel: { fontSize: 17, lineHeight: 22, fontWeight: w(600), letterSpacing: 0 },
  fTitle: { fontSize: 34, lineHeight: 41, fontWeight: w(700), letterSpacing: -0.68 },
  fSection: { fontSize: 20, lineHeight: 25, fontWeight: w(600), letterSpacing: -0.2 },
  fHeading: { fontSize: 17, lineHeight: 22, fontWeight: w(600), letterSpacing: 0 },
  fBody: { fontSize: 17, lineHeight: 22, fontWeight: w(400), letterSpacing: 0 },
  fSmall: { fontSize: 15, lineHeight: 20, fontWeight: w(400), letterSpacing: 0 },
  fMeta: { fontSize: 13, lineHeight: 18, fontWeight: w(400), letterSpacing: 0.13 },
  fBadge: { fontSize: 12, lineHeight: 16, fontWeight: w(600), letterSpacing: 0.12 },
} as const;

// Molas (react-native-reanimated: withSpring aceita duration + dampingRatio, os mesmos parâmetros da Apple).
// duration aproxima a "response" da Apple (quão rápido chega). Ajuste no aparelho comparando com o protótipo da Sheet.
export const spring = {
  standard: { dampingRatio: 1, duration: 350 },   // padrão: sem quique
  move: { dampingRatio: 1, duration: 400 },       // reposicionar algo grande
  sheet: { dampingRatio: 1, duration: 350 },      // abrir/fechar folha por toque
  flick: { dampingRatio: 0.85, duration: 300 },   // soltar folha arremessada (só no modo família)
} as const;

export const press = { scale: 0.97, durationMs: 100 } as const; // reação no toque, não na soltura

// Projeção de momento (amostra da Apple, Designing Fluid Interfaces). velocity em px/s.
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// Resistência elástica além do limite.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export type ThemeName = keyof typeof colors;
