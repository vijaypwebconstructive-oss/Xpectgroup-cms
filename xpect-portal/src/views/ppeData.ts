import { PPEItemType } from '../types';

export const PPE_ITEM_ICONS: Record<PPEItemType, string> = {
  'Safety Gloves':              'back_hand',
  'Safety Shoes':               'hiking',
  'High-Visibility Vest':       'directions_run',
  'Face Mask / Respirator':     'masks',
  'Eye Protection':             'visibility',
  'Apron / Protective Clothing':'dry_cleaning',
};

export const PPE_ITEM_COLORS: Record<PPEItemType, string> = {
  'Safety Gloves':              'bg-blue-100 text-blue-700',
  'Safety Shoes':               'bg-amber-100 text-amber-700',
  'High-Visibility Vest':       'bg-yellow-100 text-yellow-700',
  'Face Mask / Respirator':     'bg-teal-100 text-teal-700',
  'Eye Protection':             'bg-violet-100 text-violet-700',
  'Apron / Protective Clothing':'bg-rose-100 text-rose-700',
};

export const ALL_PPE_TYPES: PPEItemType[] = [
  'Safety Gloves',
  'Safety Shoes',
  'High-Visibility Vest',
  'Face Mask / Respirator',
  'Eye Protection',
  'Apron / Protective Clothing',
];

// PPE records and inventory are now fetched from API via PPERecordsContext.
// Only static helpers and types are kept here.
