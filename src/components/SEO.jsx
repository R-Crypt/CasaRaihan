import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage, 
  schema 
}) {
  const siteName = "Casa Raihan | Homestay in Coorg";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || "Experience the authentic coffee planter lifestyle at Casa Raihan, a boutique homestay in Virajpet, Coorg. Discover lush plantations, valley views, and modern comforts.";
  const url = canonicalUrl || typeof window !== 'undefined' ? window.location.href : 'https://casaraihan.com';
  const defaultImage = "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=630&fit=crop";

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage || defaultImage} />

      {/* Structured Data (Schema.org) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
