"use client";

import React from "react";
import { useEditableElement } from "@/components/editable-wrapper";
import type { Invitation } from "@/types/invitation";

interface ExampleNewThemeProps {
  invitation: Invitation;
  formData?: Record<string, Record<string, string>>;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

/**
 * Example of how easy it is to create a new theme with the new architecture
 * No need to implement click-to-edit logic - just use the useEditableElement hook!
 */
export function ExampleNewTheme({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  isEditable = false,
  onFieldClick
}: ExampleNewThemeProps) {
  // Get the editable element creator - this handles all click-to-edit logic
  const createEditableElement = useEditableElement(isEditable, onFieldClick);

  // Helper function to get field values
  const getValue = (path: string): string => {
    const [section, field] = path.split('.');
    return formData?.[section]?.[field] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header Section */}
      <section className="py-20 px-8 text-center">
        {/* Title - automatically becomes clickable when in editor mode */}
        {createEditableElement(
          "cover",
          "title",
          getValue("cover.title") || invitationTitle || "Your Event Title",
          "text-6xl font-bold text-purple-800 mb-4"
        )}
        
        {/* Subtitle - automatically becomes clickable when in editor mode */}
        {getValue("cover.subtitle") && createEditableElement(
          "cover",
          "subtitle", 
          getValue("cover.subtitle"),
          "text-2xl text-purple-600 mb-8"
        )}
      </section>

      {/* Content Section */}
      <section className="py-16 px-8 bg-white/80">
        <div className="max-w-4xl mx-auto text-center">
          {/* Description - automatically becomes clickable when in editor mode */}
          {getValue("opening.quotes") && createEditableElement(
            "opening",
            "quotes",
            getValue("opening.quotes"),
            "text-xl text-gray-700 leading-relaxed italic"
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 px-8 text-center bg-purple-100">
        <p className="text-purple-600">
          {invitationUrl && `Visit: invitree.com/${invitationUrl}`}
        </p>
      </section>
    </div>
  );
}

/*
THAT'S IT! 

With the new architecture:
1. Import useEditableElement hook
2. Call it once: const createEditableElement = useEditableElement(isEditable, onFieldClick)
3. Wrap any content you want to be editable with createEditableElement()
4. No need to implement hover effects, click handlers, or edit indicators
5. Everything is handled automatically by the EditableWrapper component

The theme stays clean and focused on presentation, while editing functionality
is provided by the reusable wrapper system.
*/
