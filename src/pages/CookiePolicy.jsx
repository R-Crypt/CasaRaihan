import React from 'react';
import SEO from '@/components/SEO';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <SEO 
        title="Cookie Policy" 
        description="Cookie Policy for Casa Raihan Homestay."
      />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>We use cookies and similar tracking technologies to track the activity on our website and hold certain information.</p>
          
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">What are Cookies?</h2>
            <p>Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">Cookies We Use</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Session Cookies:</strong> We use Session Cookies to operate our Authentication service.</li>
              <li><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences.</li>
              <li><strong>Security Cookies:</strong> We use Security Cookies for security purposes.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
