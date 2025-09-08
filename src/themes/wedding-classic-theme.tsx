"use client";

import React from "react";
import { useEditableElement } from "@/components/editable-wrapper";
import type { Invitation } from "@/types/invitation";

interface WeddingClassicThemeProps {
  invitation: Invitation;
  formData?: Record<string, Record<string, string>>;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

export function WeddingClassicTheme({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  isEditable = false,
  onFieldClick
}: WeddingClassicThemeProps) {
  const weddingDetails = invitation.typeSpecificDetails?.[0];
  const createEditableElement = useEditableElement(isEditable, onFieldClick);
  
  if (!weddingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wedding Details Not Available</h2>
          <p className="text-gray-600">This invitation doesn't have wedding-specific details.</p>
        </div>
      </div>
    );
  }

  // Helper function to get value from form data or wedding details
  const getValue = (path: string, fallback: any = "") => {
    // Try to get from form data first (for live editing)
    const pathParts = path.split('.');
    if (formData && pathParts.length === 2) {
      const [section, field] = pathParts;
      const value = formData[section]?.[field];
      if (value) return value;
    }
    
    // Fallback to wedding details
    switch (path) {
      case "cover.title":
        return weddingDetails.coverSection?.title || fallback;
      case "cover.subtitle":
        return weddingDetails.coverSection?.subtitle || fallback;
      case "cover.header":
        return weddingDetails.coverSection?.header || fallback;
      case "cover.subheader":
        return weddingDetails.coverSection?.subheader || fallback;
      case "opening.quotes":
        return weddingDetails.openingSection?.quotes || fallback;
      case "opening.decorationUrl":
        return weddingDetails.openingSection?.decorationUrl || fallback;
      case "opening.imageUrl":
        return weddingDetails.openingSection?.imageUrl || fallback;
      case "additional.additionalNote":
        return weddingDetails.additionalNote || fallback;
      default:
        return fallback;
    }
  };

  const groomDetails = weddingDetails.groomDetails?.find(d => d.gender === "male");
  const brideDetails = weddingDetails.groomDetails?.find(d => d.gender === "female");
  const akadEvent = weddingDetails.eventDetails?.find(e => e.eventName?.toLowerCase().includes("akad"));
  const resepsiEvent = weddingDetails.eventDetails?.find(e =>
    e.eventName?.toLowerCase().includes("resepsi") ||
    e.eventName?.toLowerCase().includes("reception")
  );

  // Get array indices for click-to-edit
  const groomIndex = weddingDetails.groomDetails?.findIndex(d => d.gender === "male") ?? -1;
  const brideIndex = weddingDetails.groomDetails?.findIndex(d => d.gender === "female") ?? -1;
  const akadIndex = weddingDetails.eventDetails?.findIndex(e => e.eventName?.toLowerCase().includes("akad")) ?? -1;
  const resepsiIndex = weddingDetails.eventDetails?.findIndex(e =>
    e.eventName?.toLowerCase().includes("resepsi") ||
    e.eventName?.toLowerCase().includes("reception")
  ) ?? -1;

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      };
    } catch {
      return { date: '', time: '' };
    }
  };



  return (
    <div className="wedding-classic-theme min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 text-sm sm:text-base">
      {/* Cover Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 py-8 sm:py-16">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-rose-200 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-purple-200 rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Decorative Border */}
          <div className="border-4 border-rose-300 border-double p-6 sm:p-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl">
            {getValue("cover.header") &&
              createEditableElement(
                "cover",
                "header",
                getValue("cover.header"),
                "text-lg text-rose-600 font-light mb-6 uppercase tracking-widest"
              )
            }

            {createEditableElement(
              "cover",
              "title",
              getValue("cover.title") || invitationTitle || "Wedding Invitation",
              "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-gray-800 mb-6 sm:mb-8 leading-tight"
            )}

            {getValue("cover.subtitle") &&
              createEditableElement(
                "cover",
                "subtitle",
                getValue("cover.subtitle"),
                "text-2xl text-gray-600 font-light mb-8"
              )
            }

            {getValue("cover.subheader") &&
              createEditableElement(
                "cover",
                "subheader",
                getValue("cover.subheader"),
                "text-lg text-rose-600 font-light uppercase tracking-wide"
              )
            }

            {/* Decorative Divider */}
            <div className="flex items-center justify-center my-8">
              <div className="w-16 h-px bg-rose-300"></div>
              <div className="mx-4 w-3 h-3 bg-rose-400 rounded-full"></div>
              <div className="w-16 h-px bg-rose-300"></div>
            </div>

            {/* Event Date */}
            {akadEvent && (
              <div className="text-xl text-gray-700 font-light">
                {formatDateTime(akadEvent.datetimeStart).date}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Opening Section */}
      {getValue("opening.quotes") && (
        <section className="py-12 sm:py-20 px-4 sm:px-8 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            {getValue("opening.decorationUrl") && (
              <div className="mb-8">
                <img 
                  src={getValue("opening.decorationUrl")} 
                  alt="Decoration" 
                  className="w-32 h-auto mx-auto opacity-70"
                />
              </div>
            )}
            
            {createEditableElement(
              "opening",
              "quotes",
              <>
                <span className="text-6xl text-rose-300 absolute -top-4 -left-4">"</span>
                {getValue("opening.quotes")}
                <span className="text-6xl text-rose-300 absolute -bottom-8 -right-4">"</span>
              </>,
              "text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-gray-700 italic leading-relaxed mb-6 sm:mb-8 relative"
            )}
            
            {getValue("opening.imageUrl") && (
              <div className="mt-12">
                <img 
                  src={getValue("opening.imageUrl")} 
                  alt="Opening" 
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-xl"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Couple Section */}
      {(groomDetails || brideDetails) && (
        <section className="py-12 sm:py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center text-gray-800 mb-8 sm:mb-12 md:mb-16">
              The Couple
            </h2>

            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
              {/* Groom */}
              {groomDetails && (
                <div className="text-center">
                  <div className="bg-white rounded-lg shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
                    {groomDetails.imageUrl && (
                      <div className="mb-6">
                        <img 
                          src={groomDetails.imageUrl} 
                          alt={groomDetails.name}
                          className="w-48 h-48 mx-auto rounded-full object-cover shadow-lg border-4 border-rose-200"
                        />
                      </div>
                    )}
                    {createEditableElement(
                      "groomDetails",
                      `${groomIndex}.name`,
                      groomDetails.name,
                      "text-3xl font-serif text-gray-800 mb-2"
                    )}
                    {groomDetails.fullName &&
                      createEditableElement(
                        "groomDetails",
                        `${groomIndex}.fullName`,
                        groomDetails.fullName,
                        "text-xl text-gray-600 mb-4"
                      )
                    }
                    {groomDetails.birthOrder && (
                      <p className="text-sm text-gray-500 mb-4">
                        {typeof groomDetails.birthOrder === 'number' 
                          ? `${groomDetails.birthOrder}${groomDetails.birthOrder === 1 ? 'st' : groomDetails.birthOrder === 2 ? 'nd' : groomDetails.birthOrder === 3 ? 'rd' : 'th'} child`
                          : groomDetails.birthOrder}
                      </p>
                    )}
                    {groomDetails.additionalInfo && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {groomDetails.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Bride */}
              {brideDetails && (
                <div className="text-center">
                  <div className="bg-white rounded-lg shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
                    {brideDetails.imageUrl && (
                      <div className="mb-6">
                        <img 
                          src={brideDetails.imageUrl} 
                          alt={brideDetails.name}
                          className="w-48 h-48 mx-auto rounded-full object-cover shadow-lg border-4 border-rose-200"
                        />
                      </div>
                    )}
                    {createEditableElement(
                      "groomDetails",
                      `${brideIndex}.name`,
                      brideDetails.name,
                      "text-3xl font-serif text-gray-800 mb-2"
                    )}
                    {brideDetails.fullName &&
                      createEditableElement(
                        "groomDetails",
                        `${brideIndex}.fullName`,
                        brideDetails.fullName,
                        "text-xl text-gray-600 mb-4"
                      )
                    }
                    {brideDetails.birthOrder && (
                      <p className="text-sm text-gray-500 mb-4">
                        {typeof brideDetails.birthOrder === 'number' 
                          ? `${brideDetails.birthOrder}${brideDetails.birthOrder === 1 ? 'st' : brideDetails.birthOrder === 2 ? 'nd' : brideDetails.birthOrder === 3 ? 'rd' : 'th'} child`
                          : brideDetails.birthOrder}
                      </p>
                    )}
                    {brideDetails.additionalInfo && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {brideDetails.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Event Details Section */}
      {(akadEvent || resepsiEvent) && (
        <section className="py-20 px-8 bg-gradient-to-br from-white to-rose-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-serif text-center text-gray-800 mb-16">
              Event Details
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Akad Event */}
              {akadEvent && (
                <div className="bg-white rounded-lg shadow-xl p-8 border-l-4 border-rose-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {createEditableElement(
                      "eventDetails",
                      `${akadIndex}.eventName`,
                      akadEvent.eventName,
                      "text-2xl font-serif text-gray-800 mb-4 capitalize"
                    )}
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{formatDateTime(akadEvent.datetimeStart).date}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{formatDateTime(akadEvent.datetimeStart).time} - {formatDateTime(akadEvent.datetimeEnd).time}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {createEditableElement(
                          "eventDetails",
                          `${akadIndex}.eventLocation`,
                          akadEvent.eventLocation,
                          "font-medium"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resepsi Event */}
              {resepsiEvent && (
                <div className="bg-white rounded-lg shadow-xl p-8 border-l-4 border-pink-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    {createEditableElement(
                      "eventDetails",
                      `${resepsiIndex}.eventName`,
                      resepsiEvent.eventName,
                      "text-2xl font-serif text-gray-800 mb-4 capitalize"
                    )}
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{formatDateTime(resepsiEvent.datetimeStart).date}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{formatDateTime(resepsiEvent.datetimeStart).time} - {formatDateTime(resepsiEvent.datetimeEnd).time}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {createEditableElement(
                          "eventDetails",
                          `${resepsiIndex}.eventLocation`,
                          resepsiEvent.eventLocation,
                          "font-medium"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Additional Information Section */}
      {getValue("additional.additionalNote") && (
        <section className="py-20 px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif text-gray-800 mb-8">
              Additional Information
            </h2>
            <div className="bg-rose-50 rounded-lg p-8 border border-rose-200">
              {createEditableElement(
                "additional",
                "additionalNote",
                getValue("additional.additionalNote"),
                "text-lg text-gray-700 leading-relaxed whitespace-pre-wrap"
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-8 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif mb-2">
              {getValue("cover.title") || invitationTitle || "Wedding Invitation"}
            </h3>
            {invitationUrl && (
              <p className="text-rose-300 text-sm">
                invitree.com/{invitationUrl}
              </p>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            Thank you for being part of our special day
          </p>
        </div>
      </footer>
    </div>
  );
}
