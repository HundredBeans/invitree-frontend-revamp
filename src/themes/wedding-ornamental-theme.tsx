"use client";

import React from "react";
import { useEditableElement } from "@/components/editable-wrapper";
import type { Invitation } from "@/types/invitation";

interface WeddingOrnamentalThemeProps {
  invitation: Invitation;
  formData?: Record<string, Record<string, string>>;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

export function WeddingOrnamentalTheme({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  isEditable = false,
  onFieldClick
}: WeddingOrnamentalThemeProps) {
  const weddingDetails = invitation.typeSpecificDetails?.[0];
  const createEditableElement = useEditableElement(isEditable, onFieldClick);
  
  if (!weddingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wedding Details Not Available</h2>
          <p className="text-gray-600">This invitation doesn't have wedding-specific details.</p>
        </div>
      </div>
    );
  }

  // Helper function to get value from form data or wedding details
  const getValue = (path: string, fallback: any = "") => {
    const pathParts = path.split('.');
    if (formData && pathParts.length === 2) {
      const [section, field] = pathParts;
      const value = formData[section]?.[field];
      if (value) return value;
    }
    
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
    <div className="wedding-ornamental-theme min-h-screen bg-gradient-to-br from-amber-50 via-cream-50 to-rose-50 text-sm sm:text-base">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ornamentPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.1) rotate(2deg); opacity: 1; }
        }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .sparkle-animation { animation: sparkle 3s ease-in-out infinite; }
        .fade-in-up { animation: fadeInUp 1s ease-out; }
        .ornament-pulse { animation: ornamentPulse 4s ease-in-out infinite; }
        .bg-cream-50 { background-color: #fefdf8; }
      `}</style>

      {/* Cover Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 py-8 sm:py-16 overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute inset-0">
          {/* Floating ornamental elements */}
          <div className="absolute top-20 left-10 w-32 h-32 opacity-20 float-animation">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
              <path d="M50 10 L60 40 L90 40 L68 58 L78 88 L50 70 L22 88 L32 58 L10 40 L40 40 Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="absolute top-40 right-20 w-24 h-24 opacity-15 float-animation" style={{animationDelay: '2s'}}>
            <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="50" cy="50" r="10" fill="currentColor"/>
            </svg>
          </div>
          <div className="absolute bottom-32 left-32 w-28 h-28 opacity-25 sparkle-animation">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
              <path d="M50 5 L55 35 L85 35 L65 55 L70 85 L50 70 L30 85 L35 55 L15 35 L45 35 Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto fade-in-up">
          {/* Ornamental Border Frame */}
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-12 border-4 border-double border-amber-300">
            {/* Corner Decorations */}
            <div className="absolute -top-4 -left-4 w-8 h-8 ornament-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                <path d="M20 20 L50 5 L80 20 L95 50 L80 80 L50 95 L20 80 L5 50 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 ornament-pulse" style={{animationDelay: '1s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500">
                <path d="M20 20 L50 5 L80 20 L95 50 L80 80 L50 95 L20 80 L5 50 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 ornament-pulse" style={{animationDelay: '2s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                <path d="M20 20 L50 5 L80 20 L95 50 L80 80 L50 95 L20 80 L5 50 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 ornament-pulse" style={{animationDelay: '3s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500">
                <path d="M20 20 L50 5 L80 20 L95 50 L80 80 L50 95 L20 80 L5 50 Z" fill="currentColor"/>
              </svg>
            </div>

            {getValue("cover.header") &&
              createEditableElement(
                "cover",
                "header",
                getValue("cover.header"),
                "text-lg text-amber-700 font-light mb-6 uppercase tracking-widest"
              )
            }

            {createEditableElement(
              "cover",
              "title",
              getValue("cover.title") || invitationTitle || "Wedding Invitation",
              "text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-gray-800 mb-6 sm:mb-8 leading-tight"
            )}

            {getValue("cover.subtitle") &&
              createEditableElement(
                "cover",
                "subtitle",
                getValue("cover.subtitle"),
                "text-2xl text-gray-600 font-light mb-8 italic"
              )
            }

            {/* Ornamental Divider */}
            <div className="flex items-center justify-center my-8">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              <div className="mx-6 relative">
                <div className="w-6 h-6 bg-amber-400 rounded-full sparkle-animation"></div>
                <div className="absolute inset-0 w-6 h-6 bg-rose-400 rounded-full sparkle-animation opacity-50" style={{animationDelay: '1.5s'}}></div>
              </div>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>

            {getValue("cover.subheader") &&
              createEditableElement(
                "cover",
                "subheader",
                getValue("cover.subheader"),
                "text-lg text-amber-700 font-light uppercase tracking-wide"
              )
            }

            {/* Event Date */}
            {akadEvent && (
              <div className="text-xl text-gray-700 font-light mt-6">
                {formatDateTime(akadEvent.datetimeStart).date}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Opening Section */}
      {getValue("opening.quotes") && (
        <section className="py-16 sm:py-24 px-4 sm:px-8 bg-white/60 backdrop-blur-sm relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-1/4 w-16 h-16 opacity-10 float-animation">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                <path d="M50 10 C70 10 90 30 90 50 C90 70 70 90 50 90 C30 90 10 70 10 50 C10 30 30 10 50 10 Z M50 25 C62 25 75 38 75 50 C75 62 62 75 50 75 C38 75 25 62 25 50 C25 38 38 25 50 25 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute bottom-20 right-1/3 w-20 h-20 opacity-15 sparkle-animation" style={{animationDelay: '3s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500">
                <path d="M50 5 L60 35 L90 35 L70 55 L80 85 L50 70 L20 85 L30 55 L10 35 L40 35 Z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {getValue("opening.decorationUrl") && (
              <div className="mb-12 fade-in-up">
                <img
                  src={getValue("opening.decorationUrl")}
                  alt="Decoration"
                  className="w-40 h-auto mx-auto opacity-80 ornament-pulse"
                />
              </div>
            )}

            <div className="relative bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-8 sm:p-12 shadow-xl border border-amber-200">
              {/* Decorative Quote Marks */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center sparkle-animation">
                <span className="text-2xl text-white font-serif">"</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center sparkle-animation" style={{animationDelay: '2s'}}>
                <span className="text-2xl text-white font-serif">"</span>
              </div>

              {createEditableElement(
                "opening",
                "quotes",
                getValue("opening.quotes"),
                "text-lg sm:text-xl md:text-2xl font-serif text-gray-700 italic leading-relaxed mb-6 sm:mb-8"
              )}
            </div>

            {getValue("opening.imageUrl") && (
              <div className="mt-16 fade-in-up">
                <div className="relative inline-block">
                  <img
                    src={getValue("opening.imageUrl")}
                    alt="Opening"
                    className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border-4 border-white"
                  />
                  {/* Decorative Frame Elements */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-amber-400 rounded-full sparkle-animation"></div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-rose-400 rounded-full sparkle-animation" style={{animationDelay: '1s'}}></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-rose-400 rounded-full sparkle-animation" style={{animationDelay: '2s'}}></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-amber-400 rounded-full sparkle-animation" style={{animationDelay: '3s'}}></div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Couple Section */}
      {(groomDetails || brideDetails) && (
        <section className="py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-br from-cream-50 to-amber-50 relative overflow-hidden">
          {/* Background Ornaments */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-10 w-32 h-32 opacity-10 float-animation">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                <path d="M50 10 L65 35 L90 35 L72 53 L78 78 L50 65 L22 78 L28 53 L10 35 L35 35 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute bottom-1/4 right-10 w-28 h-28 opacity-15 sparkle-animation" style={{animationDelay: '4s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="15" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-gray-800 mb-6">
                The Couple
              </h2>
              {/* Decorative Underline */}
              <div className="flex items-center justify-center">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <div className="mx-4 w-4 h-4 bg-amber-400 rounded-full sparkle-animation"></div>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              {/* Groom */}
              {groomDetails && (
                <div className="text-center fade-in-up">
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 border-2 border-amber-200">
                    {/* Decorative Corner Elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-400 rounded-full ornament-pulse"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-rose-400 rounded-full ornament-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-rose-400 rounded-full ornament-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-amber-400 rounded-full ornament-pulse" style={{animationDelay: '3s'}}></div>

                    {groomDetails.imageUrl && (
                      <div className="mb-8 relative">
                        <div className="relative inline-block">
                          <img
                            src={groomDetails.imageUrl}
                            alt={groomDetails.name}
                            className="w-56 h-56 mx-auto rounded-full object-cover shadow-2xl border-4 border-amber-300"
                          />
                          {/* Floating decorative elements around photo */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full sparkle-animation"></div>
                          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-rose-400 rounded-full sparkle-animation" style={{animationDelay: '1.5s'}}></div>
                        </div>
                      </div>
                    )}

                    {createEditableElement(
                      "groomDetails",
                      `${groomIndex}.name`,
                      groomDetails.name,
                      "text-3xl sm:text-4xl font-serif text-gray-800 mb-3"
                    )}

                    {groomDetails.fullName &&
                      createEditableElement(
                        "groomDetails",
                        `${groomIndex}.fullName`,
                        groomDetails.fullName,
                        "text-xl text-gray-600 mb-6 font-light"
                      )
                    }

                    {groomDetails.birthOrder && (
                      <p className="text-sm text-amber-700 mb-4 font-medium">
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
                <div className="text-center fade-in-up" style={{animationDelay: '0.3s'}}>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 border-2 border-rose-200">
                    {/* Decorative Corner Elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-rose-400 rounded-full ornament-pulse"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 rounded-full ornament-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-amber-400 rounded-full ornament-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-rose-400 rounded-full ornament-pulse" style={{animationDelay: '3s'}}></div>

                    {brideDetails.imageUrl && (
                      <div className="mb-8 relative">
                        <div className="relative inline-block">
                          <img
                            src={brideDetails.imageUrl}
                            alt={brideDetails.name}
                            className="w-56 h-56 mx-auto rounded-full object-cover shadow-2xl border-4 border-rose-300"
                          />
                          {/* Floating decorative elements around photo */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 rounded-full sparkle-animation"></div>
                          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-amber-400 rounded-full sparkle-animation" style={{animationDelay: '1.5s'}}></div>
                        </div>
                      </div>
                    )}

                    {createEditableElement(
                      "groomDetails",
                      `${brideIndex}.name`,
                      brideDetails.name,
                      "text-3xl sm:text-4xl font-serif text-gray-800 mb-3"
                    )}

                    {brideDetails.fullName &&
                      createEditableElement(
                        "groomDetails",
                        `${brideIndex}.fullName`,
                        brideDetails.fullName,
                        "text-xl text-gray-600 mb-6 font-light"
                      )
                    }

                    {brideDetails.birthOrder && (
                      <p className="text-sm text-rose-700 mb-4 font-medium">
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
        <section className="py-20 px-4 sm:px-8 bg-gradient-to-br from-white via-amber-50 to-rose-50 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-24 h-24 opacity-10 float-animation">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                <path d="M50 5 L70 25 L95 25 L78 42 L85 67 L50 55 L15 67 L22 42 L5 25 L30 25 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute bottom-32 right-1/3 w-20 h-20 opacity-15 sparkle-animation" style={{animationDelay: '2s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="10" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-gray-800 mb-6">
                Event Details
              </h2>
              {/* Decorative Underline */}
              <div className="flex items-center justify-center">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
                <div className="mx-4 w-4 h-4 bg-rose-400 rounded-full sparkle-animation"></div>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Akad Event */}
              {akadEvent && (
                <div className="fade-in-up">
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-l-8 border-amber-400 hover:shadow-3xl transition-all duration-500">
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center ornament-pulse">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <div className="text-center">
                      {createEditableElement(
                        "eventDetails",
                        `${akadIndex}.eventName`,
                        akadEvent.eventName,
                        "text-3xl font-serif text-gray-800 mb-6 capitalize"
                      )}

                      <div className="space-y-4 text-gray-600">
                        <div className="flex items-center justify-center bg-amber-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-800">{formatDateTime(akadEvent.datetimeStart).date}</span>
                        </div>

                        <div className="flex items-center justify-center bg-amber-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{formatDateTime(akadEvent.datetimeStart).time} - {formatDateTime(akadEvent.datetimeEnd).time}</span>
                        </div>

                        <div className="flex items-center justify-center bg-amber-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {createEditableElement(
                            "eventDetails",
                            `${akadIndex}.eventLocation`,
                            akadEvent.eventLocation,
                            "font-medium text-gray-800"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resepsi Event */}
              {resepsiEvent && (
                <div className="fade-in-up" style={{animationDelay: '0.3s'}}>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-l-8 border-rose-400 hover:shadow-3xl transition-all duration-500">
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center ornament-pulse" style={{animationDelay: '1s'}}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      {createEditableElement(
                        "eventDetails",
                        `${resepsiIndex}.eventName`,
                        resepsiEvent.eventName,
                        "text-3xl font-serif text-gray-800 mb-6 capitalize"
                      )}

                      <div className="space-y-4 text-gray-600">
                        <div className="flex items-center justify-center bg-rose-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-800">{formatDateTime(resepsiEvent.datetimeStart).date}</span>
                        </div>

                        <div className="flex items-center justify-center bg-rose-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{formatDateTime(resepsiEvent.datetimeStart).time} - {formatDateTime(resepsiEvent.datetimeEnd).time}</span>
                        </div>

                        <div className="flex items-center justify-center bg-rose-50 rounded-lg p-3">
                          <svg className="w-5 h-5 mr-3 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {createEditableElement(
                            "eventDetails",
                            `${resepsiIndex}.eventLocation`,
                            resepsiEvent.eventLocation,
                            "font-medium text-gray-800"
                          )}
                        </div>
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
        <section className="py-20 px-4 sm:px-8 bg-white/80 backdrop-blur-sm relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-20 h-20 opacity-10 float-animation">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                <path d="M50 10 L60 40 L90 40 L68 58 L78 88 L50 70 L22 88 L32 58 L10 40 L40 40 Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-16 h-16 opacity-15 sparkle-animation" style={{animationDelay: '3s'}}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="10" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-12 fade-in-up">
              <h2 className="text-4xl sm:text-5xl font-serif text-gray-800 mb-6">
                Additional Information
              </h2>
              {/* Decorative Underline */}
              <div className="flex items-center justify-center">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <div className="mx-4 w-4 h-4 bg-amber-400 rounded-full sparkle-animation"></div>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-amber-50 via-white to-rose-50 rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-amber-200 fade-in-up">
              {/* Decorative Corner Elements */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-400 rounded-full ornament-pulse"></div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-400 rounded-full ornament-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-rose-400 rounded-full ornament-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-amber-400 rounded-full ornament-pulse" style={{animationDelay: '3s'}}></div>

              {createEditableElement(
                "additional",
                "additionalNote",
                getValue("additional.additionalNote"),
                "text-lg sm:text-xl text-gray-700 leading-relaxed whitespace-pre-wrap"
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-16 h-16 opacity-20 float-animation">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
              <path d="M50 10 L60 40 L90 40 L68 58 L78 88 L50 70 L22 88 L32 58 L10 40 L40 40 Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="absolute bottom-10 right-1/3 w-12 h-12 opacity-15 sparkle-animation" style={{animationDelay: '2s'}}>
            <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4"/>
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="50" r="10" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 fade-in-up">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 ornament-pulse">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Decorative elements around heart */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full sparkle-animation"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-400 rounded-full sparkle-animation" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-rose-400 rounded-full sparkle-animation" style={{animationDelay: '2s'}}></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 rounded-full sparkle-animation" style={{animationDelay: '3s'}}></div>
            </div>

            <h3 className="text-3xl font-serif mb-4">
              {getValue("cover.title") || invitationTitle || "Wedding Invitation"}
            </h3>

            {invitationUrl && (
              <p className="text-amber-300 text-sm mb-6">
                invitree.com/{invitationUrl}
              </p>
            )}
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <div className="mx-4 w-3 h-3 bg-amber-400 rounded-full sparkle-animation"></div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </div>

          <p className="text-gray-400 text-sm fade-in-up">
            Thank you for being part of our special day
          </p>
        </div>
      </footer>
    </div>
  );
}
