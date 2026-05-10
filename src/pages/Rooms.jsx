import React, { useState } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Users, Eye, Sparkles } from 'lucide-react';
import BookingModal from '../components/booking/BookingModal';

const RoomCard = ({ room, index, isAvailable, onBookNow }) => {
  const defaultImage = `https://r1imghtlak.mmtcdn.com/e6bbce02-8d0e-4a4f-bca2-ca902aac9a92.jpg?&output-quality=75&output-format=jpg`;
  const mainImage = room.image_url || defaultImage;
  const galleryImages = room.gallery || [];
  
  // Combine main image with gallery, removing duplicates/empties
  const allImages = Array.from(new Set([mainImage, ...galleryImages])).filter(Boolean);
  
  const [activeImage, setActiveImage] = useState(allImages[0] || defaultImage);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
        {/* Image Section */}
        <div className={`flex flex-col ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
          <div className="relative h-64 md:h-80 w-full shrink-0">
            <img 
              src={activeImage}
              alt={room.name}
              className="w-full h-full object-cover absolute inset-0"
            />
            {isAvailable && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-700 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t">
              {allImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 shrink-0 rounded-md border-2 overflow-hidden transition-all ${
                    activeImage === img ? 'border-amber-700 shadow-md ring-2 ring-amber-700/20' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-8 md:p-12 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-light text-gray-800 mb-2">{room.name}</h2>
              <div className="w-12 h-px bg-amber-600 mb-4" />
              <p className="text-gray-600 leading-relaxed">
                {room.description || "Experience comfort and tranquility in this beautifully designed room with modern amenities and stunning views."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {room.bed_type && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-amber-700" />
                  <span>{room.bed_type}</span>
                </div>
              )}
              {room.max_guests && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Up to {room.max_guests} guests</span>
                </div>
              )}
              {room.view && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-700" />
                  <span>{room.view}</span>
                </div>
              )}
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, i) => (
                    <Badge key={i} variant="secondary" className="bg-gray-100">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                <p className="text-3xl font-light text-gray-800">
                  ₹{room.price_per_night?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
              {isAvailable ? (
                <Button 
                  onClick={() => onBookNow(room)}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6"
                >
                  Book Now
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 font-medium mb-2">Not Available</p>
                  <p className="text-sm text-gray-500">Under renovation</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => RoomAPI.list(),
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['all-room-bookings'],
    queryFn: () => BookingAPI.list(),
  });

  const { data: allBlockedDates = [] } = useQuery({
    queryKey: ['all-blocked-dates'],
    queryFn: () => BlockedDateAPI.list(),
  });

  const isRoomCurrentlyAvailable = (roomId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if room is blocked
    const isBlocked = allBlockedDates.some(block => {
      if (block.room_id !== roomId) return false;
      const blockStart = new Date(block.start_date);
      const blockEnd = new Date(block.end_date);
      blockStart.setHours(0, 0, 0, 0);
      blockEnd.setHours(0, 0, 0, 0);
      return today >= blockStart && today <= blockEnd;
    });

    return !isBlocked;
  };

  const handleBookNow = async (room) => {
    if (!isRoomCurrentlyAvailable(room.id)) {
      return;
    }
    
    // Check if user is logged in
    const isAuthenticated = await auth.isAuthenticated();
    if (!isAuthenticated) {
      // Redirect to login, then come back to rooms page
      auth.redirectToLogin(window.location.href);
      return;
    }
    
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=80')" }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-white px-4">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-light tracking-widest">OUR ROOMS</h1>
            <div className="w-24 h-px bg-white/60 mx-auto" />
            <p className="text-xl font-light text-white/90 max-w-2xl">
              Thoughtfully designed spaces offering comfort and stunning views
            </p>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="space-y-12">
          {rooms.map((room, index) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              index={index} 
              isAvailable={isRoomCurrentlyAvailable(room.id)}
              onBookNow={handleBookNow} 
            />
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No rooms available at the moment.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <BookingModal 
          room={selectedRoom}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}