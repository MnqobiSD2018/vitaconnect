import { Category } from '@/types';

export const CATEGORIES: Pick<Category, 'id' | 'name' | 'slug' | 'icon'>[] = [
  { id: 1, name: 'Music', slug: 'music', icon: '🎵' },
  { id: 2, name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: 3, name: 'Arts & Theatre', slug: 'arts-theatre', icon: '🎭' },
  { id: 4, name: 'Business', slug: 'business', icon: '💼' },
  { id: 5, name: 'Food & Drink', slug: 'food-drink', icon: '🍽️' },
  { id: 6, name: 'Nightlife', slug: 'nightlife', icon: '🌃' },
  { id: 7, name: 'Comedy', slug: 'comedy', icon: '😂' },
  { id: 8, name: 'Education', slug: 'education', icon: '📚' },
  { id: 9, name: 'Charity', slug: 'charity', icon: '❤️' },
  { id: 10, name: 'Other', slug: 'other', icon: '🎉' },
];

export const CATEGORY_MAP: Record<number, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name])
);

export const CATEGORY_NAME_LIST = CATEGORIES.map((c) => c.name);
