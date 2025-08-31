// src/types/theme.ts

export interface Theme {
  id: number;
  themeName: string;
  slug: string;
  thumbnailUrl: string;
  structure_blueprint: any; // Using 'any' for now, can be typed more strictly later
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
