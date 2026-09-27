import type { ThemeName, HighlightColor } from '../types/user';

export interface AppColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  border: string;
  header: string;
  tabBar: string;
  tabInactive: string;
  overlay: string;
  danger: string;
  success: string;
  readerBackground: string;
  verseNumber: string;
  cardShadow: string;
  highContrast: boolean;
}

export const THEMES: Record<ThemeName, AppColors> = {
  light: {
    background: '#F4EFE6',
    surface: '#FFFCF7',
    surfaceMuted: '#EDE6D8',
    text: '#1C1814',
    textSecondary: '#4A433A',
    textMuted: '#7A7268',
    accent: '#1B6B3A',
    accentSoft: '#E4EDE4',
    accentText: '#FFFFFF',
    border: '#E4DCCE',
    header: '#FBF7F0',
    tabBar: '#FBF7F0',
    tabInactive: '#8A8378',
    overlay: 'rgba(28,24,20,0.4)',
    danger: '#B42318',
    success: '#067647',
    readerBackground: '#FBF7F0',
    verseNumber: '#8A6A3C',
    cardShadow: '#2A2418',
    highContrast: false,
  },
  sepia: {
    background: '#F3E6C9',
    surface: '#FBF1D8',
    surfaceMuted: '#EAD9B0',
    text: '#3B2A14',
    textSecondary: '#5C4424',
    textMuted: '#8A6A3C',
    accent: '#8A4B12',
    accentSoft: '#F0D7A8',
    accentText: '#FFF8EB',
    border: '#E0C894',
    header: '#F8EDD4',
    tabBar: '#F8EDD4',
    tabInactive: '#9A7844',
    overlay: 'rgba(40,24,8,0.45)',
    danger: '#9B1C1C',
    success: '#3B6D11',
    readerBackground: '#FBF3DE',
    verseNumber: '#8A4B12',
    cardShadow: '#3B2A14',
    highContrast: false,
  },
  dark: {
    background: '#121612',
    surface: '#1C231C',
    surfaceMuted: '#273127',
    text: '#F2F6F1',
    textSecondary: '#C5CEC4',
    textMuted: '#8C978C',
    accent: '#5FBF78',
    accentSoft: '#24472E',
    accentText: '#0C160E',
    border: '#2E392E',
    header: '#1C231C',
    tabBar: '#161C16',
    tabInactive: '#8C978C',
    overlay: 'rgba(0,0,0,0.55)',
    danger: '#F97066',
    success: '#75E0A7',
    readerBackground: '#151A15',
    verseNumber: '#7AD394',
    cardShadow: '#000000',
    highContrast: true,
  },
  amoled: {
    background: '#000000',
    surface: '#0B0B0B',
    surfaceMuted: '#161616',
    text: '#F7F7F7',
    textSecondary: '#D0D0D0',
    textMuted: '#9A9A9A',
    accent: '#4ADE80',
    accentSoft: '#052E16',
    accentText: '#001208',
    border: '#222222',
    header: '#000000',
    tabBar: '#000000',
    tabInactive: '#8A8A8A',
    overlay: 'rgba(0,0,0,0.7)',
    danger: '#FF6B6B',
    success: '#4ADE80',
    readerBackground: '#000000',
    verseNumber: '#4ADE80',
    cardShadow: '#000000',
    highContrast: true,
  },
};

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#F5E27A',
  green: '#9BE7A8',
  blue: '#9BC7F5',
  orange: '#F5C48A',
  red: '#F5A3A3',
  purple: '#D2B3F5',
};

export const HIGHLIGHT_LABELS: Record<HighlightColor, string> = {
  yellow: 'ቢጫ',
  green: 'አረንጓዴ',
  blue: 'ሰማያዊ',
  orange: 'ብርቱካን',
  red: 'ቀይ',
  purple: 'ሐምራዊ',
};

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'ብርሃን',
  dark: 'ጨለማ',
  sepia: 'ሴፒያ',
  amoled: 'AMOLED',
};
