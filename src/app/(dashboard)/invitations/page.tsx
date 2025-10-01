"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Plus, FileText, Check, Edit, ExternalLink, Crown } from "lucide-react";
import Link from "next/link";
import { getUserInvitations } from "@/lib/strapi";
import { useErrorHandler } from "@/hooks/use-error-handler";
import type { Invitation } from "@/types/invitation";

export default function InvitationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const loadInvitations = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      const data = await getUserInvitations(session.user.id, session.user.jwt);
      setInvitations(data);
    } catch (err: any) {
      console.error("Failed to load invitations:", err);
      handleError(err, "Failed to load your invitations");
    } finally {
      setLoading(false);
    }
  }, [session, handleError]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      loadInvitations();
    }
  }, [status, router, loadInvitations]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  const stats = {
    total: invitations.length,
    published: invitations.filter(inv => inv.invitationStatus === "published").length,
    drafts: invitations.filter(inv => inv.invitationStatus === "draft").length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Invitations</h1>
          <p className="text-muted-foreground">Manage your digital invitations</p>
        </div>
        <Link href="/invitations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Invitations</CardTitle>
          <CardDescription>
            {invitations.length > 0 
              ? `${invitations.length} invitation${invitations.length === 1 ? '' : 's'} found`
              : "No invitations yet"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading invitations...</span>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No invitations yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first digital invitation</p>
              <Link href="/invitations/new">
                <Button>Create Your First Invitation</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((invitation) => (
                <div key={invitation.documentId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{invitation.invitationTitle}</h3>
                      <Badge variant={getStatusVariant(invitation.invitationStatus)}>
                        {invitation.invitationStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {formatDate(invitation.createdAt)}</span>
                      {invitation.updatedAt !== invitation.createdAt && (
                        <span>• Updated {formatDate(invitation.updatedAt)}</span>
                      )}
                      {invitation.theme && (
                        <span>• {invitation.theme.themeName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.invitationStatus === "published" && invitation.invitationUrl && (
                      <Link href={`/${invitation.invitationUrl}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                    {invitation.invitationStatus === "draft" && (
                      <Link href={`/invitations/upgrade/${invitation.documentId}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-sm hover:shadow-md transition-all"
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                    <Link href={`/invitations/editor/${invitation.documentId}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
