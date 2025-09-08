"use client";

import React from "react";
import { FormInput, FormTextarea } from "@/components/ui";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "datetime-local";
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FormField[];
  isArray?: boolean;
  arrayItemTitle?: (item: any, index: number) => string;
}

interface FormRendererProps {
  sections: FormSection[];
  data: any;
  expandedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  onFieldChange: (path: string, value: any) => void;
  pendingFieldFocus?: { section: string; field: string; arrayIndex?: number } | null;
}

export function FormRenderer({
  sections,
  data,
  expandedSections,
  onToggleSection,
  onFieldChange,
  pendingFieldFocus,
}: FormRendererProps) {
  const renderField = (field: FormField, value: any, basePath: string, sectionId?: string, arrayIndex?: number) => {
    const fieldPath = `${basePath}.${field.key}`;
    const fieldId = `${basePath}-${field.key}`;

    // Check if this field should be focused
    // For array fields, also check if the array index matches
    const shouldFocus = Boolean(pendingFieldFocus &&
      pendingFieldFocus.section === (sectionId || basePath) &&
      pendingFieldFocus.field === field.key &&
      (pendingFieldFocus.arrayIndex === undefined || pendingFieldFocus.arrayIndex === arrayIndex));

    if (shouldFocus) {
      console.log("Field should focus:", {
        fieldKey: field.key,
        sectionId,
        basePath,
        arrayIndex,
        pendingFieldFocus
      });
    }

    const commonProps = {
      id: fieldId,
      label: field.label,
      placeholder: field.placeholder,
      value: value || "",
      required: field.required,
      autoFocus: shouldFocus,
      className: shouldFocus ? "ring-2 ring-blue-500" : "",
    };

    switch (field.type) {
      case "textarea":
        return (
          <FormTextarea
            key={field.key}
            {...commonProps}
            rows={field.rows || 4}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onFieldChange(fieldPath, e.target.value)
            }
          />
        );
      case "number":
        return (
          <FormInput
            key={field.key}
            {...commonProps}
            type="number"
            value={value?.toString() || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(fieldPath, e.target.value ? parseInt(e.target.value) : null)
            }
          />
        );
      case "datetime-local":
        return (
          <FormInput
            key={field.key}
            {...commonProps}
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(fieldPath, e.target.value ? new Date(e.target.value).toISOString() : null)
            }
          />
        );
      default:
        return (
          <FormInput
            key={field.key}
            {...commonProps}
            type={field.type || "text"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFieldChange(fieldPath, e.target.value)
            }
          />
        );
    }
  };

  const renderSection = (section: FormSection) => {
    // Handle direct fields (like additionalNote) vs nested sections (like coverSection)
    const sectionData = section.id === "additional" ? data : data?.[section.id];
    const IconComponent = section.icon;

    return (
      <div key={section.id} className="border rounded-lg">
        <button
          onClick={() => onToggleSection(section.id)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span className="font-medium">{section.title}</span>
          </div>
          {expandedSections.has(section.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expandedSections.has(section.id) && (
          <div className="p-3 border-t space-y-4">
            {section.isArray ? (
              // Render array items
              sectionData?.map((item: any, index: number) => {
                // Check if any field in this array item should be focused
                const shouldExpandItem = pendingFieldFocus &&
                  pendingFieldFocus.section === section.id &&
                  section.fields.some(field => field.key === pendingFieldFocus.field);

                return (
                  <div
                    key={index}
                    className={`border rounded p-3 space-y-3 ${shouldExpandItem ? 'ring-2 ring-blue-300' : ''}`}
                  >
                    <h4 className="font-medium">
                      {section.arrayItemTitle ? section.arrayItemTitle(item, index) : `Item ${index + 1}`}
                    </h4>
                    {section.fields.map((field) =>
                      renderField(field, item[field.key], `${section.id}.${index}`, section.id, index)
                    )}
                  </div>
                );
              })
            ) : (
              // Render regular fields
              section.fields.map((field) => {
                const fieldPath = section.id === "additional" ? field.key : section.id;
                const fieldValue = section.id === "additional" ? data?.[field.key] : sectionData?.[field.key];
                return renderField(field, fieldValue, fieldPath, section.id, undefined);
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map(renderSection)}
    </div>
  );
}
