import { Platform, type TextStyle } from 'react-native';

/**
 * System fonts are used because this project does not ship Ethiopic .ttf files.
 * Android/iOS fall back to Noto/system Ethiopic coverage.
 */
export const ethiopicFont: TextStyle['fontFamily'] = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: undefined,
});

export function readerTextStyle(fontSize: number, lineHeight: number, color: string): TextStyle {
  return {
    fontFamily: ethiopicFont,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeight),
    color,
    includeFontPadding: false,
  };
}
