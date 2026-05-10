import React from 'react';
import SEO from '@/components/SEO';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <SEO 
        title="Cancellation & Refund Policy" 
        description="Cancellation and Refund Policy for Casa Raihan Homestay."
      />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-lg">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">Cancellation & Refund Policy</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">Cancellation Timelines</h2>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>More than 7 days before check-in:</strong> 100% refund of the booking amount.</li>
              <li><strong>48 hours to 7 days before check-in:</strong> 50% refund of the booking amount.</li>
              <li><strong>Less than 48 hours / No Shows:</strong> No refund will be provided.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">Refund Process</h2>
            <p>Approved refunds will be processed within 5-7 business days to the original method of payment.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
