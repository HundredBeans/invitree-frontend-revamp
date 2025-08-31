// This file defines the structure of an Invitation object
// that we receive from the Strapi API.

export interface Invitation {
  id: number;
  invitationTitle: string;
  invitationUrl: string;
  invitationType: "Wedding" | "Event";
  eventDate: string | null; // Dates are often strings in JSON
  invitationStatus: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
