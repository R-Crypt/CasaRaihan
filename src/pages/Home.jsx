import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ChevronDown, Coffee, Wifi, Car, UtensilsCrossed, Mountain, Sun } from 'lucide-react';
import SEO from '@/components/SEO';

export default function Home() {
  const navigate = useNavigate();

  const scrollToRooms = () => {
    document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const lodgingSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Casa Raihan",
    "description": "Nestled in the serene hills of Coorg, experience authentic hospitality where the aroma of freshly brewed coffee meets the tranquility of nature.",
    "url": "https://casaraihan.com",
    "telephone": "+91 9480083984",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Virajpet",
      "addressLocality": "Coorg",
      "addressRegion": "Karnataka",
      "postalCode": "571218",
      "addressCountry": "IN"
    },
    "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
    "priceRange": "₹1200 - ₹3000"
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Home" 
        schema={lodgingSchema}
      />
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://r1imghtlak.mmtcdn.com/e6bbce02-8d0e-4a4f-bca2-ca902aac9a92.jpg?&output-quality=75&output-format=jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-light tracking-widest">
              CASA RAIHAN
            </h1>
            <div className="w-24 h-px bg-white/60 mx-auto" />
            <p className="text-xl md:text-2xl font-light tracking-wide">
              HOMESTAY
            </p>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mt-4 leading-relaxed">
              Nestled in the serene hills of Coorg, experience authentic hospitality
              where the aroma of freshly brewed coffee meets the tranquility of nature
            </p>
          </div>
          
          <button 
            onClick={scrollToRooms}
            className="absolute bottom-12 animate-bounce"
          >
            <ChevronDown className="w-8 h-8 text-white/80" />
          </button>
        </div>
      </div>

      {/* About Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 tracking-wide">
              Discover Casa Raihan
            </h2>
            <div className="w-16 h-px bg-amber-600" />
            <p className="text-lg text-gray-600 leading-relaxed">
              A Coffee Planter turned Entrepreneur welcomes you to a boutique homestay, 
              blending the charm of plantation life with warm hospitality and modern comforts.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Experience an authentic stay surrounded by the aroma of freshly brewed coffee 
              and the tranquility of nature. Our homestay offers you a perfect escape from 
              the bustling city life, where you can reconnect with nature and yourself.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Located in Virajpet, Coorg, we provide comfortable accommodation with valley 
              and garden views, along with modern amenities to make your stay memorable.
            </p>
          </div>
          <div className="relative h-96 md:h-[500px]">
            <img 
              src="https://r1imghtlak.mmtcdn.com/e6bbce02-8d0e-4a4f-bca2-ca902aac9a92.jpg?&output-quality=75&output-format=jpg"
              alt="Casa Raihan"
              className="w-full h-full object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-800 tracking-wide mb-4">
              Amenities & Experiences
            </h2>
            <div className="w-16 h-px bg-amber-600 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
                <Coffee className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Coffee Plantation</h3>
              <p className="text-gray-600">
                Experience the authentic coffee planter lifestyle amidst lush plantations
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <UtensilsCrossed className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Shared Kitchen</h3>
              <p className="text-gray-600">
                Fully equipped kitchen available for cooking both veg and non-veg meals
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Wifi className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Modern Comforts</h3>
              <p className="text-gray-600">
                Air conditioning, WiFi, and all modern amenities for your comfort
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                <Car className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Free Parking</h3>
              <p className="text-gray-600">
                Complimentary parking space available for all guests
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
                <Mountain className="w-8 h-8 text-orange-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Valley Views</h3>
              <p className="text-gray-600">
                Breathtaking views of Coorg's lush valleys from your room
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                <Sun className="w-8 h-8 text-yellow-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-800">Lounge & Dining</h3>
              <p className="text-gray-600">
                Comfortable lounges and dining areas to relax and unwind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Preview Section */}
      <section id="rooms-section" className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-800 tracking-wide mb-4">
              Our Rooms
            </h2>
            <div className="w-16 h-px bg-amber-600 mx-auto mb-6" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our thoughtfully designed rooms, each offering comfort and stunning views
            </p>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate(createPageUrl('Rooms'))}
              className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-lg"
            >
              View All Rooms & Book Now
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-wide">
            Your Perfect Coorg Escape Awaits
          </h2>
          <p className="text-xl text-white/90">
            Book your stay and immerse yourself in the tranquility of nature
          </p>
          <Button 
            onClick={() => navigate(createPageUrl('Rooms'))}
            className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 text-lg"
          >
            Reserve Your Room
          </Button>
        </div>
      </section>
    </div>
  );
}