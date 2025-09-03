// Helper functions for theme management

import type { Invitation, TypeSpecificDetails } from "@/types/invitation";

/**
 * Extracts form data from typeSpecificDetails for the editor
 * @param typeSpecificDetails The wedding-specific details
 * @returns Form data object for the editor
 */
export function extractFormDataFromTypeSpecificDetails(
  typeSpecificDetails?: TypeSpecificDetails,
): Record<string, Record<string, string>> {
  if (!typeSpecificDetails || typeSpecificDetails.length === 0) {
    return {};
  }

  const weddingDetails = typeSpecificDetails[0];
  const formData: Record<string, Record<string, string>> = {};

  // Cover section
  if (weddingDetails.coverSection) {
    formData.cover = {
      title: weddingDetails.coverSection.title || "",
      subtitle: weddingDetails.coverSection.subtitle || "",
      header: weddingDetails.coverSection.header || "",
      subheader: weddingDetails.coverSection.subheader || "",
    };
  }

  // Opening section
  if (weddingDetails.openingSection) {
    formData.opening = {
      quotes: weddingDetails.openingSection.quotes || "",
      decorationUrl: weddingDetails.openingSection.decorationUrl || "",
      imageUrl: weddingDetails.openingSection.imageUrl || "",
    };
  }

  // Groom details (assuming first is groom, second is bride)
  if (weddingDetails.groomDetails && weddingDetails.groomDetails.length > 0) {
    const groom = weddingDetails.groomDetails.find(detail => detail.gender === "male");
    const bride = weddingDetails.groomDetails.find(detail => detail.gender === "female");

    formData.groomDetails = {
      groomName: groom?.name || "",
      groomFullName: groom?.fullName || "",
      groomImageUrl: groom?.imageUrl || "",
      groomBirthOrder: groom?.birthOrder?.toString() || "",
      groomAdditionalInfo: groom?.additionalInfo || "",
      brideName: bride?.name || "",
      brideFullName: bride?.fullName || "",
      brideImageUrl: bride?.imageUrl || "",
      brideBirthOrder: bride?.birthOrder?.toString() || "",
      brideAdditionalInfo: bride?.additionalInfo || "",
    };
  }

  // Event details
  if (weddingDetails.eventDetails && weddingDetails.eventDetails.length > 0) {
    const akad = weddingDetails.eventDetails.find(event => 
      event.eventName.toLowerCase().includes("akad")
    );
    const resepsi = weddingDetails.eventDetails.find(event => 
      event.eventName.toLowerCase().includes("resepsi") || 
      event.eventName.toLowerCase().includes("reception")
    );

    formData.eventDetails = {
      akadEventName: akad?.eventName || "",
      akadDatetimeStart: akad?.datetimeStart ? new Date(akad.datetimeStart).toISOString().slice(0, 16) : "",
      akadDatetimeEnd: akad?.datetimeEnd ? new Date(akad.datetimeEnd).toISOString().slice(0, 16) : "",
      akadLocation: akad?.eventLocation || "",
      resepsiEventName: resepsi?.eventName || "",
      resepsiDatetimeStart: resepsi?.datetimeStart ? new Date(resepsi.datetimeStart).toISOString().slice(0, 16) : "",
      resepsiDatetimeEnd: resepsi?.datetimeEnd ? new Date(resepsi.datetimeEnd).toISOString().slice(0, 16) : "",
      resepsiLocation: resepsi?.eventLocation || "",
    };
  }

  // Additional information
  formData.additional = {
    additionalNote: weddingDetails.additionalNote || "",
  };

  return formData;
}

/**
 * Converts form data back to typeSpecificDetails structure
 * @param formData The form data from the editor
 * @param existingDetails Existing typeSpecificDetails to preserve IDs
 * @returns TypeSpecificDetails array
 */
export function convertFormDataToTypeSpecificDetails(
  formData: Record<string, Record<string, string>>,
  existingDetails?: TypeSpecificDetails,
): TypeSpecificDetails {
  const existingWeddingDetails = existingDetails?.[0];
  
  const weddingDetails = {
    __component: "invitation-details.wedding-details" as const,
    id: existingWeddingDetails?.id || 1,
    additionalNote: formData.additional?.additionalNote || null,
    coverSection: {
      id: existingWeddingDetails?.coverSection?.id || 1,
      title: formData.cover?.title || "",
      subtitle: formData.cover?.subtitle || null,
      header: formData.cover?.header || null,
      subheader: formData.cover?.subheader || null,
    },
    openingSection: {
      id: existingWeddingDetails?.openingSection?.id || 1,
      quotes: formData.opening?.quotes || null,
      decorationUrl: formData.opening?.decorationUrl || null,
      imageUrl: formData.opening?.imageUrl || null,
    },
    eventDetails: [
      {
        id: existingWeddingDetails?.eventDetails?.[0]?.id || 1,
        eventName: formData.eventDetails?.akadEventName || "akad",
        datetimeStart: formData.eventDetails?.akadDatetimeStart ? 
          new Date(formData.eventDetails.akadDatetimeStart).toISOString() : 
          new Date().toISOString(),
        datetimeEnd: formData.eventDetails?.akadDatetimeEnd ? 
          new Date(formData.eventDetails.akadDatetimeEnd).toISOString() : 
          new Date().toISOString(),
        eventLocation: formData.eventDetails?.akadLocation || "",
      },
      {
        id: existingWeddingDetails?.eventDetails?.[1]?.id || 2,
        eventName: formData.eventDetails?.resepsiEventName || "resepsi",
        datetimeStart: formData.eventDetails?.resepsiDatetimeStart ? 
          new Date(formData.eventDetails.resepsiDatetimeStart).toISOString() : 
          new Date().toISOString(),
        datetimeEnd: formData.eventDetails?.resepsiDatetimeEnd ? 
          new Date(formData.eventDetails.resepsiDatetimeEnd).toISOString() : 
          new Date().toISOString(),
        eventLocation: formData.eventDetails?.resepsiLocation || "",
      },
    ],
    medias: existingWeddingDetails?.medias || null,
    groomDetails: [
      {
        id: existingWeddingDetails?.groomDetails?.[0]?.id || 1,
        name: formData.groomDetails?.groomName || "",
        gender: "male" as const,
        fullName: formData.groomDetails?.groomFullName || "",
        imageUrl: formData.groomDetails?.groomImageUrl || null,
        birthOrder: formData.groomDetails?.groomBirthOrder ? 
          parseInt(formData.groomDetails.groomBirthOrder) : null,
        additionalInfo: formData.groomDetails?.groomAdditionalInfo || null,
      },
      {
        id: existingWeddingDetails?.groomDetails?.[1]?.id || 2,
        name: formData.groomDetails?.brideName || "",
        gender: "female" as const,
        fullName: formData.groomDetails?.brideFullName || "",
        imageUrl: formData.groomDetails?.brideImageUrl || null,
        birthOrder: formData.groomDetails?.brideBirthOrder ? 
          parseInt(formData.groomDetails.brideBirthOrder) : null,
        additionalInfo: formData.groomDetails?.brideAdditionalInfo || null,
      },
    ],
  };

  return [weddingDetails];
}
