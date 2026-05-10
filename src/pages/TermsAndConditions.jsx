import React from 'react';
import SEO from '@/components/SEO';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <SEO 
        title="Terms & Conditions" 
        description="Terms and Conditions for Casa Raihan Homestay. Read our rules, booking terms, and guidelines for your stay in Coorg."
      />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">Terms & Conditions</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing this website and booking a stay at Casa Raihan, you accept and agree to be bound by these terms and conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">2. Booking and Payments</h2>
            <p>All bookings are subject to availability. A valid ID is required at check-in. Payments must be completed as per the terms specified during checkout.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">3. House Rules</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Check-in time is 1:00 PM and Check-out is 11:00 AM.</li>
              <li>Guests are responsible for any damages caused to the property during their stay.</li>
              <li>Casa Raihan is a nature-friendly homestay; loud music outdoors after 10:00 PM is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">4. Disclaimer</h2>
            <p>Casa Raihan is not liable for any personal injuries, loss of property, or accidents that occur on the premises. Guests use the amenities at their own risk.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
