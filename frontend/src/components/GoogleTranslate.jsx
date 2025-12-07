import React, { useEffect } from "react";
import { Globe, ChevronUp } from "lucide-react"; // Changed to ChevronUp

const GoogleTranslate = () => {
  useEffect(() => {
    if (document.querySelector("#google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.id = "google-translate-script";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    // "relative" restricts the invisible Google overlay to THIS button only
    <div className="relative inline-block z-50 group font-mono">
      
      {/* VISUAL BUTTON */}
      <div className="flex items-center gap-3 bg-cyber-black/90 backdrop-blur-xl px-4 py-3 rounded-xl border border-cyber-green/40 shadow-[0_0_15px_rgba(0,255,157,0.1)] hover:shadow-[0_0_25px_rgba(0,255,157,0.4)] hover:border-cyber-green transition-all cursor-pointer">
        <Globe size={20} className="text-cyber-green animate-pulse" />
        <span className="text-sm font-bold tracking-widest text-cyber-green uppercase hidden md:block">
          Translate
        </span>
        {/* Pointing up because we are moving it to the bottom */}
        <ChevronUp size={16} className="text-cyber-green/70" />
      </div>

      {/* INVISIBLE OVERLAY (Strictly covers the button above) */}
      <div 
        id="google_translate_element" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer overflow-hidden rounded-xl"
      ></div>
    </div>
  );
};

export default GoogleTranslate;