// Default data templates for different invitation types

export interface DefaultInvitationData {
  invitationTitle: string;
  eventDate: string;
  typeSpecificDetails: any[];
}

/**
 * Get default invitation data based on invitation type
 * @param invitationType The type of invitation
 * @returns Default invitation data
 */
export function getDefaultInvitationData(invitationType: "Wedding" | "Event"): DefaultInvitationData {
  const currentYear = new Date().getFullYear();
  const defaultDate = `${currentYear + 1}-12-31`;

  if (invitationType === "Wedding") {
    return {
      invitationTitle: "Bride & Groom",
      eventDate: defaultDate,
      typeSpecificDetails: [
        {
          __component: "invitation-details.wedding-details",
          additionalNote: "Please join us for this joyous celebration of love. Your presence is the greatest gift we could ask for as we begin our new journey together.",
          coverSection: {
            title: "Bride & Groom",
            subtitle: "Together Forever",
            header: "The Wedding of",
            subheader: "request the honor of your presence"
          },
          openingSection: {
            quotes: "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day. We are excited to share this special moment with our beloved family and friends.",
            decorationUrl: "https://via.placeholder.com/200x100/F43F5E/FFFFFF?text=Decoration",
            imageUrl: "https://via.placeholder.com/600x400/F8FAFC/6B7280?text=Couple+Photo"
          },
          eventDetails: [
            {
              eventName: "Wedding Ceremony",
              datetimeStart: `${defaultDate}T04:00:00.000Z`,
              datetimeEnd: `${defaultDate}T06:00:00.000Z`,
              eventLocation: "Main Wedding Venue"
            },
            {
              eventName: "Wedding Reception",
              datetimeStart: `${defaultDate}T07:00:00.000Z`,
              datetimeEnd: `${defaultDate}T10:00:00.000Z`,
              eventLocation: "Reception Hall"
            }
          ],
          coupleDetails: [
            {
              name: "Groom Name",
              gender: "male",
              fullName: "Groom Full Name",
              imageUrl: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Groom+Photo",
              birthOrder: 1,
              additionalInfo: "Son of Mr. Father Name and Mrs. Mother Name. Brief description about the groom's background, education, or profession."
            },
            {
              name: "Bride Name",
              gender: "female",
              fullName: "Bride Full Name",
              imageUrl: "https://via.placeholder.com/300x300/EC4899/FFFFFF?text=Bride+Photo",
              birthOrder: 1,
              additionalInfo: "Daughter of Mr. Father Name and Mrs. Mother Name. Brief description about the bride's background, education, or profession."
            }
          ]
        }
      ]
    };
  }

  // Default for "Event" type
  return {
    invitationTitle: "Special Event",
    eventDate: defaultDate,
    typeSpecificDetails: [
      {
        __component: "invitation-details.event-details",
        additionalNote: "We cordially invite you to join us for this special event. Your presence would make this occasion even more meaningful.",
        coverSection: {
          title: "Special Event",
          subtitle: "Join Us",
          header: "You're Invited to",
          subheader: "celebrate with us"
        },
        openingSection: {
          quotes: "Great moments are born from great opportunities. Join us as we celebrate this special occasion together.",
          decorationUrl: "https://via.placeholder.com/200x100/1F2937/FFFFFF?text=Event+Decoration",
          imageUrl: "https://via.placeholder.com/600x400/F8FAFC/6B7280?text=Event+Photo"
        },
        eventDetails: [
          {
            eventName: "Main Event",
            datetimeStart: `${defaultDate}T06:00:00.000Z`,
            datetimeEnd: `${defaultDate}T10:00:00.000Z`,
            eventLocation: "Event Venue"
          }
        ]
      }
    ]
  };
}

/**
 * Get default data for specific invitation types with more variety
 */
export const INVITATION_TYPE_DEFAULTS = {
  Wedding: {
    titles: ["Bride & Groom", "Our Wedding", "Wedding Celebration"],
    themes: ["Classic", "Elegant", "Romantic", "Modern"],
    venues: ["Main Wedding Venue", "Church", "Garden Venue", "Beach Resort"],
    receptionVenues: ["Reception Hall", "Ballroom", "Garden Reception", "Banquet Hall"]
  },
  Event: {
    titles: ["Special Event", "Celebration", "Gathering", "Party"],
    themes: ["Professional", "Casual", "Festive", "Corporate"],
    venues: ["Event Venue", "Conference Center", "Community Hall", "Hotel Ballroom"]
  },
  Birthday: {
    titles: ["Birthday Celebration", "Birthday Party", "Birthday Bash"],
    themes: ["Fun", "Elegant", "Casual", "Themed"],
    venues: ["Party Venue", "Home", "Restaurant", "Event Hall"]
  },
  Graduation: {
    titles: ["Graduation Ceremony", "Graduation Celebration", "Academic Achievement"],
    themes: ["Academic", "Formal", "Celebratory"],
    venues: ["University Auditorium", "School Hall", "Convention Center"]
  }
} as const;

/**
 * Generate a random default title for an invitation type
 * @param invitationType The type of invitation
 * @returns A random default title
 */
export function getRandomDefaultTitle(invitationType: keyof typeof INVITATION_TYPE_DEFAULTS): string {
  const titles = INVITATION_TYPE_DEFAULTS[invitationType]?.titles || ["Special Event"];
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Generate a random default venue for an invitation type
 * @param invitationType The type of invitation
 * @returns A random default venue
 */
export function getRandomDefaultVenue(invitationType: keyof typeof INVITATION_TYPE_DEFAULTS): string {
  const venues = INVITATION_TYPE_DEFAULTS[invitationType]?.venues || ["Event Venue"];
  return venues[Math.floor(Math.random() * venues.length)];
}
