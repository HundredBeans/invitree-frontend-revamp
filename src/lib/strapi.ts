// src/lib/strapi.ts

import { ApiErrorHandler } from "@/lib/api-error-handler";
import type {
  ApiRequestOptions,
  StrapiCollectionResponse,
  StrapiSingleResponse,
} from "@/types/api";
import type {
  LoginCredentials,
  RegisterData,
  StrapiAuthResponse,
} from "@/types/auth";
import type {
  CreateInvitationData,
  Invitation,
  UpdateInvitationData,
} from "@/types/invitation";
import type { Theme } from "@/types/theme";
import { getDefaultInvitationData } from "@/lib/invitation-defaults";

// Get the Strapi URL from the environment variables, with a fallback for safety.
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * A helper function to perform fetch requests to the Strapi API.
 * @param endpoint The API endpoint to call (e.g., '/api/auth/local/register').
 * @param options The options for the fetch request (method, headers, body).
 * @returns The JSON response from the API.
 */
async function fetchApi<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const requestUrl = `${STRAPI_URL}${endpoint}`;

  // Use the centralized error handler
  const apiErrorHandler = ApiErrorHandler;
  return apiErrorHandler.safeFetch<T>(requestUrl, mergedOptions);
}

/**
 * Registers a new user with Strapi.
 * @param userData The user data for registration.
 * @returns The newly created user object.
 */
export async function registerUser(
  userData: RegisterData,
): Promise<StrapiAuthResponse> {
  return fetchApi<StrapiAuthResponse>("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Logs in a user with Strapi.
 * @param credentials The user's login credentials.
 * @returns An object containing the JWT and the user data.
 */
export async function loginUser(
  credentials: LoginCredentials,
): Promise<StrapiAuthResponse> {
  return fetchApi<StrapiAuthResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Fetches the invitations for a specific user.
 * This function requires an authenticated request.
 * @param userId The ID of the user.
 * @param jwt The user's JSON Web Token for authentication.
 * @returns A list of the user's invitations.
 */
export async function getUserInvitations(
  userId: string,
  jwt: string,
): Promise<Invitation[]> {
  if (!userId || !jwt) {
    throw new Error("User ID and JWT are required to fetch invitations.");
  }

  const query = `/api/invitations?filters[owner][id][$eq]=${userId}&populate=*`;

  const response = await fetchApi<StrapiCollectionResponse<Invitation>>(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  console.log("response", response);

  // The response from Strapi is often { data: [...], meta: {...} }
  return response.data;
}

/**
 * Fetches all available themes from Strapi.
 * This is a public request and does not require authentication.
 * @returns A list of all themes.
 */
export async function getThemes(): Promise<Theme[]> {
  const response =
    await fetchApi<StrapiCollectionResponse<Theme>>("/api/themes");
  return response.data;
}





/**
 * Creates a new draft invitation for a user.
 * @param themeId The ID of the theme being used.
 * @param userId The ID of the owner.
 * @param jwt The user's JSON Web Token for authentication.
 * @param invitationType The type of invitation to create (defaults to "Wedding").
 * @returns The newly created invitation object.
 */
export async function createInvitation(
  themeId: number,
  userId: number,
  jwt: string,
  invitationType: "Wedding" | "Event" = "Wedding",
): Promise<Invitation> {
  const timestamp = Date.now();
  const defaultData = getDefaultInvitationData(invitationType);

  const createData: CreateInvitationData = {
    invitationTitle: defaultData.invitationTitle,
    invitationUrl: `${invitationType.toLowerCase()}-${timestamp}`,
    invitationType: invitationType,
    eventDate: defaultData.eventDate,
    theme: themeId,
    owner: userId,
    typeSpecificDetails: defaultData.typeSpecificDetails,
  };

  const response = await fetchApi<StrapiSingleResponse<Invitation>>(
    "/api/invitations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: createData,
      }),
    },
  );

  return response.data;
}

/**
 * Fetches a single invitation by its ID, ensuring to populate the theme.
 * @param id The ID of the invitation.
 * @param jwt The user's JSON Web Token.
 * @returns The invitation object with its theme data.
 */
export async function getInvitationById(
  id: string,
  jwt: string,
): Promise<Invitation> {
  // We add `publicationState=preview` to include draft entries in the result.
  const query = `/api/invitations/${id}?&publicationState=preview&populate[theme]=true&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][eventDetails][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][openingSection][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][coverSection][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][medias][populate][medias][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][groomDetails][populate][parentProfiles][populate]=*`;
  const response = await fetchApi<StrapiSingleResponse<Invitation>>(query, {
    method: "GET",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return response.data;
}

/**
 * Clean data for Strapi update by removing problematic fields and handling component structure
 */
function cleanDataForUpdate(data: UpdateInvitationData): any {
  const cleaned: any = {};

  // Copy basic fields
  if (data.invitationTitle !== undefined) cleaned.invitationTitle = data.invitationTitle;
  if (data.invitationUrl !== undefined) cleaned.invitationUrl = data.invitationUrl;
  if (data.invitationStatus !== undefined) cleaned.invitationStatus = data.invitationStatus;
  if (data.eventDate !== undefined) cleaned.eventDate = data.eventDate;

  // Handle typeSpecificDetails - this is the main component data
  if (data.typeSpecificDetails) {
    cleaned.typeSpecificDetails = data.typeSpecificDetails.map((component: any) => {
      // For updates, we don't need any ID fields - Strapi handles them automatically
      const cleanedComponent: any = {
        __component: component.__component,
      };

      // Copy all other fields, cleaning nested objects (skip __component and id completely)
      for (const [key, value] of Object.entries(component)) {
        if (key !== '__component' && key !== 'id') {
          cleanedComponent[key] = cleanNestedObject(value);
        }
      }

      return cleanedComponent;
    });
  }

  // Skip the 'content' field as it's just form data, not Strapi data
  // The actual data should be in typeSpecificDetails

  return cleaned;
}

/**
 * Clean nested objects by removing empty values and id fields
 * Remove all id fields as Strapi handles them automatically during updates
 */
function cleanNestedObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanNestedObject(item));
  }

  if (obj && typeof obj === 'object') {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip all id fields - Strapi handles them automatically during updates
      if (key === 'id') {
        continue;
      }

      // Include non-empty values
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = cleanNestedObject(value);
      }
    }

    return cleaned;
  }

  return obj;
}

/**
 * Updates an invitation.
 * @param id The ID of the invitation to update.
 * @param data The data to update.
 * @param jwt The user's JSON Web Token.
 * @returns The updated invitation object.
 */
export async function updateInvitation(
  id: string,
  data: UpdateInvitationData,
  jwt: string,
): Promise<Invitation> {
  // Clean the data to handle nested component IDs properly
  const cleanedData = cleanDataForUpdate(data);

  // Debug: Log the cleaned data to see what's being sent
  console.log('Cleaned data being sent to Strapi:', JSON.stringify(cleanedData, null, 2));

  const response = await fetchApi<StrapiSingleResponse<Invitation>>(
    `/api/invitations/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: cleanedData }), // Strapi expects the data to be wrapped in a 'data' object
    },
  );
  return response.data;
}

/**
 * Fetches a published invitation by its URL and type for public display.
 * This is a public request and does not require authentication.
 * @param invitationUrl The URL slug of the invitation.
 * @param invitationType The type of invitation ("Wedding" or "Event").
 * @returns The invitation object with its theme data.
 */
export async function getPublicInvitation(
  invitationUrl: string,
  invitationType: "Wedding" | "Event",
): Promise<Invitation> {
  // Build query to find invitation by URL and type
  // For now, we'll also include draft invitations for testing (remove this in production)
  const query = `/api/invitations?filters[invitationUrl][$eq]=${encodeURIComponent(invitationUrl)}&filters[invitationType][$eq]=${invitationType}&populate[theme]=true&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][eventDetails][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][openingSection][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][coverSection][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][medias][populate][medias][populate]=*&populate[typeSpecificDetails][on][invitation-details.wedding-details][populate][groomDetails][populate][parentProfiles][populate]=*`;

  const response = await fetchApi<StrapiCollectionResponse<Invitation>>(query, {
    method: "GET",
  });

  // Check if invitation was found
  if (!response.data || response.data.length === 0) {
    throw new Error("Invitation not found");
  }

  // For production, add this check back:
  // const invitation = response.data[0];
  // if (invitation.invitationStatus !== 'published') {
  //   throw new Error("Invitation not found or not published");
  // }

  return response.data[0]; // Return the first (and should be only) result
}
