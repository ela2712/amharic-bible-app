export const SOLID_BACKGROUNDS = [
  { id: 'emerald', bg: '#0F3D2E', fg: '#F4FFF7', name: 'አረንጓዴ' },
  { id: 'gold', bg: '#3D2E0F', fg: '#FFF6D8', name: 'ወርቅ' },
  { id: 'midnight', bg: '#12141C', fg: '#EEF2FF', name: 'ምሽት' },
  { id: 'parchment', bg: '#F4E6C3', fg: '#3B2A14', name: 'ብራና' },
  { id: 'dawn', bg: '#D7ECF5', fg: '#16324A', name: 'ንጋት' },
  { id: 'crimson', bg: '#4A1518', fg: '#FFE8E8', name: 'ቀይ' },
] as const;

export const PHOTO_BACKGROUNDS = [
  {
    id: 'cross',
    name: 'መስቀል',
    source: require('../../assets/verse-backgrounds/cross.jpg'),
  },
  {
    id: 'sunrise',
    name: 'ፀሐይ መውጣት',
    source: require('../../assets/verse-backgrounds/sunrise.jpg'),
  },
  {
    id: 'bible',
    name: 'መጽሐፍ',
    source: require('../../assets/verse-backgrounds/bible.jpg'),
  },
  {
    id: 'ocean',
    name: 'ባሕር',
    source: require('../../assets/verse-backgrounds/ocean.jpg'),
  },
  {
    id: 'forest',
    name: 'ደን',
    source: require('../../assets/verse-backgrounds/forest.jpg'),
  },
] as const;

export type SolidBackgroundId = (typeof SOLID_BACKGROUNDS)[number]['id'];
export type PhotoBackgroundId = (typeof PHOTO_BACKGROUNDS)[number]['id'];
