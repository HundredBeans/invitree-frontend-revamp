// Utility functions for invitation URL mapping and handling

/**
 * Maps invitation types to URL prefixes
 */
export const INVITATION_TYPE_TO_URL_PREFIX = {
  Wedding: 'w',
  Event: 'e',
} as const;

/**
 * Maps URL prefixes to invitation types
 */
export const URL_PREFIX_TO_INVITATION_TYPE = {
  w: 'Wedding',
  e: 'Event',
} as const;

export type UrlPrefix = keyof typeof URL_PREFIX_TO_INVITATION_TYPE;
export type InvitationType = 'Wedding' | 'Event';

/**
 * Converts an invitation type to its URL prefix
 * @param invitationType The invitation type
 * @returns The URL prefix (w for Wedding, e for Event)
 */
export function getUrlPrefixFromType(invitationType: InvitationType): UrlPrefix {
  return INVITATION_TYPE_TO_URL_PREFIX[invitationType];
}

/**
 * Converts a URL prefix to its invitation type
 * @param urlPrefix The URL prefix (w or e)
 * @returns The invitation type (Wedding or Event)
 */
export function getTypeFromUrlPrefix(urlPrefix: string): InvitationType {
  if (urlPrefix in URL_PREFIX_TO_INVITATION_TYPE) {
    return URL_PREFIX_TO_INVITATION_TYPE[urlPrefix as UrlPrefix];
  }
  throw new Error(`Invalid URL prefix: ${urlPrefix}. Must be 'w' for Wedding or 'e' for Event.`);
}

/**
 * Validates if a URL prefix is valid
 * @param urlPrefix The URL prefix to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrlPrefix(urlPrefix: string): urlPrefix is UrlPrefix {
  return urlPrefix in URL_PREFIX_TO_INVITATION_TYPE;
}

/**
 * Builds the public invitation URL
 * @param invitationType The invitation type
 * @param invitationUrl The invitation URL slug
 * @returns The full public URL path
 */
export function buildInvitationUrl(invitationType: InvitationType, invitationUrl: string): string {
  const prefix = getUrlPrefixFromType(invitationType);
  return `/${prefix}/${invitationUrl}`;
}

/**
 * Parses a public invitation URL to extract type and slug
 * @param urlPath The URL path (e.g., "/w/john-sarah" or "/e/birthday-party")
 * @returns Object containing the invitation type and URL slug
 */
export function parseInvitationUrl(urlPath: string): { invitationType: InvitationType; invitationUrl: string } {
  // Remove leading slash if present
  const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  
  // Split the path
  const parts = cleanPath.split('/');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid invitation URL format: ${urlPath}. Expected format: /[w|e]/[slug]`);
  }
  
  const [prefix, slug] = parts;
  
  if (!isValidUrlPrefix(prefix)) {
    throw new Error(`Invalid URL prefix: ${prefix}. Must be 'w' for Wedding or 'e' for Event.`);
  }
  
  if (!slug || slug.trim() === '') {
    throw new Error(`Invalid invitation slug: ${slug}. Slug cannot be empty.`);
  }
  
  return {
    invitationType: getTypeFromUrlPrefix(prefix),
    invitationUrl: slug,
  };
}
