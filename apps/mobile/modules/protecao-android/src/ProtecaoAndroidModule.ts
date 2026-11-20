import { NativeModule, requireNativeModule } from 'expo';

declare class ProtecaoAndroidModule extends NativeModule<{}> {}

export default requireNativeModule<ProtecaoAndroidModule>('ProtecaoAndroid');
