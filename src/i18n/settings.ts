export const languages = ['vi', 'en'] as const;
export type Language = (typeof languages)[number];