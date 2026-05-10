import React from 'react';
import SEO from '@/components/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <SEO 
        title="Privacy Policy" 
        description="Privacy Policy for Casa Raihan Homestay in Coorg. Learn how we handle and protect your personal data."
      />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">1. Information We Collect</h2>
            <p>At Casa Raihan, we collect personal information that you provide to us when you make a booking, register an account, or contact us. This includes your name, email address, phone number, and special requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">2. How We Use Your Information</h2>
            <p>We use your information strictly to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and manage your homestay reservations.</li>
              <li>Communicate with you regarding your stay.</li>
              <li>Improve our website and services.</li>
              <li>Comply with legal obligations under the Indian Digital Personal Data Protection (DPDP) Act and basic GDPR standards.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">3. Data Sharing and Security</h2>
            <p>Your data is securely stored using Supabase (our backend provider). We do NOT sell your personal data to third parties. Payments are handled securely via third-party PCI-compliant processors, and we never store raw credit card details.</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">4. Your Rights</h2>
            <p>You have the right to request access to, correction of, or deletion of your personal data. Please contact us at rayaankhaaan@gmail.com to exercise these rights.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
