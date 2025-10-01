import { Heart, MessageSquare, Users, Calendar, Info } from "lucide-react";
import type { FormSection } from "@/components/form-renderer";

export const weddingFormSections: FormSection[] = [
  {
    id: "coverSection",
    title: "Cover Section",
    icon: Heart,
    fields: [
      {
        key: "title",
        label: "Title",
        placeholder: "e.g., Daffa & Afifa",
        required: true,
      },
      {
        key: "subtitle",
        label: "Subtitle",
        placeholder: "e.g., Together Forever",
      },
      {
        key: "header",
        label: "Header",
        placeholder: "e.g., Assalamualaikum",
      },
      {
        key: "subheader",
        label: "Subheader",
        placeholder: "e.g., request the honor of your presence",
      },
    ],
  },
  {
    id: "openingSection",
    title: "Opening Section",
    icon: MessageSquare,
    fields: [
      {
        key: "quotes",
        label: "Quotes",
        type: "textarea",
        placeholder: "Enter a meaningful quote or personal message for your guests",
        rows: 4,
      },
      {
        key: "decorationUrl",
        label: "Decoration URL",
        type: "url",
        placeholder: "https://example.com/decoration.png",
      },
      {
        key: "imageUrl",
        label: "Image URL",
        type: "url",
        placeholder: "https://example.com/opening-image.jpg",
      },
    ],
  },
  {
    id: "coupleDetails",
    title: "Couple Details",
    icon: Users,
    isArray: true,
    arrayItemTitle: (item: any) => item.gender === "male" ? "Groom" : "Bride",
    fields: [
      {
        key: "name",
        label: "Name",
        placeholder: "e.g., Daffa",
        required: true,
      },
      {
        key: "fullName",
        label: "Full Name",
        placeholder: "e.g., Mohammad Daffa",
      },
      {
        key: "imageUrl",
        label: "Photo URL",
        type: "url",
        placeholder: "https://example.com/photo.jpg",
      },
      {
        key: "birthOrder",
        label: "Birth Order",
        type: "number",
        placeholder: "e.g., 2",
      },
      {
        key: "additionalInfo",
        label: "Additional Info",
        placeholder: "Additional information",
      },
    ],
  },
  {
    id: "eventDetails",
    title: "Event Details",
    icon: Calendar,
    isArray: true,
    arrayItemTitle: (item: any) => item.eventName || "Event",
    fields: [
      {
        key: "eventName",
        label: "Event Name",
        placeholder: "e.g., Akad Nikah",
        required: true,
      },
      {
        key: "datetimeStart",
        label: "Start Date & Time",
        type: "datetime-local",
        required: true,
      },
      {
        key: "datetimeEnd",
        label: "End Date & Time",
        type: "datetime-local",
      },
      {
        key: "eventLocation",
        label: "Location",
        placeholder: "e.g., Masjid Istiqlal",
        required: true,
      },
    ],
  },
  {
    id: "additional",
    title: "Additional Information",
    icon: Info,
    fields: [
      {
        key: "additionalNote",
        label: "Additional Notes",
        type: "textarea",
        placeholder: "Any additional information for your guests",
        rows: 4,
      },
    ],
  },
];
