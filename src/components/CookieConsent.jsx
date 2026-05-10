import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 text-white p-4 md:p-6 z-[100] shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300 flex-1">
          <p className="mb-2"><strong>We value your privacy</strong></p>
          <p>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies in accordance with our <a href="/PrivacyPolicy" className="text-amber-500 hover:underline">Privacy Policy</a> and <a href="/CookiePolicy" className="text-amber-500 hover:underline">Cookie Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-gray-600 text-gray-300 hover:text-white" onClick={handleDecline}>
            Decline
          </Button>
          <Button className="flex-1 md:flex-none bg-amber-700 hover:bg-amber-800 text-white" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
