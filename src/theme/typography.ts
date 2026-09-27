import { useFonts } from 'expo-font';
import { NotoSansEthiopic_400Regular } from '@expo-google-fonts/noto-sans-ethiopic';
import { NotoSerifEthiopic_400Regular } from '@expo-google-fonts/noto-serif-ethiopic';
import { useEffect } from 'react';
import type { TextStyle } from 'react-native';
import type { ReaderFontStyle } from '../types/user';

const FAMILY: Record<ReaderFontStyle, string> = {
  sans: 'NotoSansEthiopic_400Regular',
  serif: 'NotoSerifEthiopic_400Regular',
  medium: 'NotoSansEthiopic_400Regular',
  condensed: 'NotoSansEthiopic_400Regular',
};

let fontsReady = false;

export function FontLoader() {
  const [loaded, error] = useFonts({
    NotoSansEthiopic_400Regular,
    NotoSerifEthiopic_400Regular,
  });
  useEffect(() => {
    if (loaded && !error) {
      fontsReady = true;
    }
  }, [loaded, error]);
  return null;
}

export function fontFamilyForStyle(style: ReaderFontStyle): string | undefined {
  if (!fontsReady) {
    return undefined;
  }
  return FAMILY[style] ?? FAMILY.sans;
}

export function readerTextStyle(
  fontSize: number,
  lineHeight: number,
  color: string,
  fontStyle: ReaderFontStyle = 'sans',
): TextStyle {
  return {
    fontFamily: fontFamilyForStyle(fontStyle),
    fontSize,
    lineHeight: Math.round(fontSize * lineHeight),
    color,
    includeFontPadding: false,
  };
}
