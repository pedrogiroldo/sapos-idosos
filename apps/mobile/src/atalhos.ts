import * as IntentLauncher from 'expo-intent-launcher';
import { Linking } from 'react-native';

export type AtalhoId = 'ligar' | 'whatsapp' | 'camera' | 'fotos';
export type Atalho = { id: AtalhoId; rotulo: string; abrir(): Promise<void> };

const PLAY_STORE_WHATSAPP = 'market://details?id=com.whatsapp';

async function abrirWhatsapp() {
  if (await Linking.canOpenURL('whatsapp://send')) {
    await Linking.openURL('whatsapp://send');
  } else {
    await Linking.openURL(PLAY_STORE_WHATSAPP);
  }
}

export const atalhos: Atalho[] = [
  { id: 'ligar', rotulo: 'Ligar', abrir: () => Linking.openURL('tel:') },
  { id: 'whatsapp', rotulo: 'WhatsApp', abrir: abrirWhatsapp },
  {
    id: 'camera',
    rotulo: 'Câmera',
    abrir: async () => {
      await IntentLauncher.startActivityAsync('android.media.action.STILL_IMAGE_CAMERA');
    },
  },
  {
    id: 'fotos',
    rotulo: 'Fotos',
    // ACTION_MAIN + APP_GALLERY abre o app de galeria do aparelho (VIEW image/* sem dado não abre nada).
    abrir: async () => {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        category: 'android.intent.category.APP_GALLERY',
      });
    },
  },
];
