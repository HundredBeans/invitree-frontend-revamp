// This file defines the structure of an Invitation object
// that we receive from the Strapi API.

import type { Theme } from "./theme";

// Content structure for invitation data
export interface InvitationContent {
  [sectionId: string]: {
    [fieldId: string]: string;
  };
}

// Wedding-specific data structures
export interface CoverSection {
  id: number;
  title: string;
  subtitle?: string | null;
  header?: string | null;
  subheader?: string | null;
}

export interface OpeningSection {
  id: number;
  quotes?: string | null;
  decorationUrl?: string | null;
  imageUrl?: string | null;
}

export interface EventDetail {
  id: number;
  eventName: string;
  datetimeStart: string;
  datetimeEnd: string;
  eventLocation: string;
}

export interface GroomDetail {
  id: number;
  name: string;
  gender: "male" | "female";
  fullName: string;
  imageUrl?: string | null;
  birthOrder?: number | null;
  additionalInfo?: string | null;
}

export interface WeddingDetails {
  __component: "invitation-details.wedding-details";
  id: number;
  additionalNote?: string | null;
  coverSection: CoverSection;
  openingSection: OpeningSection;
  eventDetails: EventDetail[];
  medias?: any | null;
  groomDetails: GroomDetail[];
}

export type TypeSpecificDetails = WeddingDetails[];

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
  typeSpecificDetails?: TypeSpecificDetails;
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
  typeSpecificDetails?: TypeSpecificDetails;
}
