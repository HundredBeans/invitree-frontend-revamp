import { Metadata } from "next";
import { getPublicInvitation } from "@/lib/strapi";
import { getTypeFromUrlPrefix, isValidUrlPrefix } from "@/lib/invitation-url-utils";
import { notFound } from "next/navigation";

interface InvitationLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: InvitationLayoutProps): Promise<Metadata> {
  try {
    // Await params in Next.js 15
    const { type, slug } = await params;

    // Validate URL prefix
    if (!isValidUrlPrefix(type)) {
      return {
        title: "Invitation Not Found",
        description: "The invitation you're looking for doesn't exist.",
      };
    }

    // Get invitation type from URL prefix
    const invitationType = getTypeFromUrlPrefix(type);

    // Fetch the invitation
    const invitation = await getPublicInvitation(slug, invitationType);

    const title = `${invitation.invitationTitle} - Digital Invitation`;
    const description = `You're invited to ${invitation.invitationTitle}. View this beautiful digital ${invitation.invitationType.toLowerCase()} invitation.`;
    const url = `/${type}/${slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url,
        siteName: "Invitree",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Invitation Not Found",
      description: "The invitation you're looking for doesn't exist or may have been removed.",
    };
  }
}

export default function InvitationLayout({ children }: InvitationLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
