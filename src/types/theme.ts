// src/types/theme.ts

export interface Theme {
  id: number;
  themeName: string;
  slug: string;
  thumbnailUrl: string;
  // We don't need the full structure_blueprint on the listing page
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
