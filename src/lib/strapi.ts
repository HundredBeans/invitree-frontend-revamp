// src/lib/strapi.ts

import type { Invitation } from "@/types/invitation";
import type { Theme } from "@/types/theme";
import type { User } from "@/types/user";

// Get the Strapi URL from the environment variables, with a fallback for safety.
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * A helper function to perform fetch requests to the Strapi API.
 * @param endpoint The API endpoint to call (e.g., '/api/auth/local/register').
 * @param options The options for the fetch request (method, headers, body).
 * @returns The JSON response from the API.
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
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

  try {
    const response = await fetch(requestUrl, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Strapi API Error:", errorData);
      const errorMessage =
        errorData.error?.message || "An unknown error occurred.";
      throw new Error(errorMessage);
    }

    // Handle responses that might not have a body (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    }
    return {}; // Return empty object for non-json responses
  } catch (error) {
    console.error("Fetch API failed:", error);
    throw error;
  }
}

/**
 * Registers a new user with Strapi.
 * @param userData The user data for registration.
 * @returns The newly created user object.
 */
export async function registerUser(userData: any): Promise<User> {
  return fetchApi("/api/auth/local/register", {
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
  credentials: any,
): Promise<{ jwt: string; user: User }> {
  return fetchApi("/api/auth/local", {
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
  userId: number,
  jwt: string,
): Promise<Invitation[]> {
  if (!userId || !jwt) {
    throw new Error("User ID and JWT are required to fetch invitations.");
  }

  const query = `/api/invitations?filters[owner][id][$eq]=${userId}&populate=*`;

  const response = await fetchApi(query, {
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
  const response = await fetchApi("/api/themes");
  return response.data;
}

/**
 * Creates a new draft invitation for a user.
 * @param themeId The ID of the theme being used.
 * @param userId The ID of the owner.
 * @param jwt The user's JSON Web Token for authentication.
 * @returns The newly created invitation object.
 */
export async function createInvitation(
  themeId: number,
  userId: number,
  jwt: string,
): Promise<Invitation> {
  const response = await fetchApi("/api/invitations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        // We'll pre-fill with some defaults. The user will change these in the editor.
        invitationTitle: "Untitled Invitation",
        invitationUrl: `draft-${Date.now()}`, // Temporary unique URL
        invitationType: "Event", // Default type, can be improved later
        theme: themeId,
        owner: userId,
      },
    }),
  });

  return response.data;
}
