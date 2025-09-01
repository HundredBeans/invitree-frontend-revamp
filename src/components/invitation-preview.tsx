"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Invitation, InvitationContent } from "@/types/invitation";
import type { StructureBlueprint, ThemeSection, ThemeField } from "@/types/theme";

interface InvitationPreviewProps {
  invitation: Invitation;
  formData: InvitationContent;
  invitationTitle: string;
  invitationUrl: string;
}

export function InvitationPreview({ 
  invitation, 
  formData, 
  invitationTitle, 
  invitationUrl 
}: InvitationPreviewProps) {
  const blueprint = invitation.theme?.structure_blueprint;

  const renderField = (section: ThemeSection, field: ThemeField) => {
    const value = formData[section.id]?.[field.id] || "";

    if (!value) return null;

    // Enhanced styling based on field type and content
    const getFieldStyling = (fieldType: string, label: string) => {
      // Special styling for common invitation fields
      if (label.toLowerCase().includes('title') || label.toLowerCase().includes('heading')) {
        return "text-lg font-semibold text-foreground";
      }
      if (label.toLowerCase().includes('date') || label.toLowerCase().includes('time')) {
        return "text-base font-medium text-primary";
      }
      if (label.toLowerCase().includes('location') || label.toLowerCase().includes('venue')) {
        return "text-base text-foreground italic";
      }
      if (fieldType === 'textarea') {
        return "text-sm text-foreground leading-relaxed";
      }
      return "text-base text-foreground";
    };

    switch (field.type) {
      case "textarea":
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <div className={`whitespace-pre-wrap ${getFieldStyling(field.type, field.label)}`}>
              {value}
            </div>
          </div>
        );

      case "date":
      case "datetime-local":
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <div className={getFieldStyling(field.type, field.label)}>
              {field.type === "date"
                ? new Date(value).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : new Date(value).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
              }
            </div>
          </div>
        );
      
      case "email":
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <a
              href={`mailto:${value}`}
              className="text-primary hover:underline transition-colors"
            >
              {value}
            </a>
          </div>
        );

      case "tel":
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <a
              href={`tel:${value}`}
              className="text-primary hover:underline transition-colors"
            >
              {value}
            </a>
          </div>
        );

      case "url":
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors inline-flex items-center gap-1"
            >
              {value}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        );

      default:
        return (
          <div key={`${section.id}-${field.id}`} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {field.label}
            </div>
            <div className={getFieldStyling(field.type, field.label)}>
              {value}
            </div>
          </div>
        );
    }
  };

  const renderSection = (section: ThemeSection) => {
    const hasContent = section.fields.some(field => 
      formData[section.id]?.[field.id]
    );

    if (!hasContent) return null;

    return (
      <div key={section.id} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          {section.name}
        </h3>
        <div className="space-y-2">
          {section.fields.map(field => renderField(section, field))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview container with invitation styling */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-lg p-6 border-2 border-dashed border-muted-foreground/20">
          {/* Main invitation title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
              {invitationTitle || "Your Invitation Title"}
            </h1>
            {invitationUrl && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                invitree.com/{invitationUrl}
              </div>
            )}
          </div>

          {/* Theme-based content sections */}
          {blueprint?.sections ? (
            <div className="space-y-8">
              {blueprint.sections.map(renderSection)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No theme structure available for preview</p>
              <p className="text-xs mt-1">Content will appear here as you type</p>
            </div>
          )}

          {/* Footer info */}
          <div className="mt-12 pt-6 border-t border-muted-foreground/20">
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <span className="bg-muted/50 rounded-full px-2 py-1">
                {invitation.invitationType}
              </span>
              <span className="bg-muted/50 rounded-full px-2 py-1 capitalize">
                {invitation.invitationStatus}
              </span>
              {invitation.eventDate && (
                <span className="bg-muted/50 rounded-full px-2 py-1">
                  {new Date(invitation.eventDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
