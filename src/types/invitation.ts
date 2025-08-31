// This file defines the structure of an Invitation object
// that we receive from the Strapi API.

import type { Theme } from "./theme";

// Content structure for invitation data
export interface InvitationContent {
  [sectionId: string]: {
    [fieldId: string]: string;
  };
}

export interface Invitation {
  id: number;
  documentId: string;
  invitationTitle: string;
  invitationUrl: string;
  invitationType: "Wedding" | "Event";
  eventDate: string | null; // Dates are often strings in JSON
  invitationStatus: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  theme: Theme;
  content: InvitationContent;
}

// For creating new invitations
export interface CreateInvitationData {
  invitationTitle: string;
  invitationUrl: string;
  invitationType: "Wedding" | "Event";
  theme: number; // Theme ID
  owner: number; // User ID
}

// For updating invitations
export interface UpdateInvitationData {
  invitationTitle?: string;
  invitationUrl?: string;
  content?: InvitationContent;
}
