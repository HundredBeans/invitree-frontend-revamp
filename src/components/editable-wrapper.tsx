"use client";

import React from "react";

interface EditableWrapperProps {
  section: string;
  field: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that makes any content clickable for editing
 * Only applies click-to-edit functionality when isEditable is true
 */
export function EditableWrapper({
  section,
  field,
  isEditable = false,
  onFieldClick,
  children,
  className = ""
}: EditableWrapperProps) {
  // Only make elements clickable if in editable mode and onFieldClick is provided
  if (!isEditable || !onFieldClick) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`${className} cursor-pointer hover:bg-black/5 hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all duration-200 relative group`}
      onClick={(e) => {
        e.stopPropagation();
        onFieldClick(section, field);
      }}
      title={`Click to edit ${field}`}
    >
      {children}
      {/* Edit indicator */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          Edit
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to create editable elements easily
 */
export function useEditableElement(
  isEditable?: boolean,
  onFieldClick?: (section: string, field: string) => void
) {
  return (
    section: string,
    field: string,
    content: React.ReactNode,
    className: string = ""
  ) => (
    <EditableWrapper
      section={section}
      field={field}
      isEditable={isEditable}
      onFieldClick={onFieldClick}
      className={className}
    >
      {content}
    </EditableWrapper>
  );
}
