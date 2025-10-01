// src/types/theme.ts

export interface ThemeField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "tel"
    | "url"
    | "date"
    | "datetime-local";
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  inferredFrom?: string;
}

export interface ThemeSection {
  id: string;
  name: string;
  fields: ThemeField[];
}

export interface StructureBlueprint {
  sections: ThemeSection[];
}

export interface Theme {
  id: number;
  documentId: string;
  themeName: string;
  slug: string;
  thumbnailUrl: string;
  invitationType: "wedding" | "event";
  structure_blueprint: StructureBlueprint;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
