import React, { useState, useRef, useEffect } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Users, Eye, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import BookingModal from '../components/booking/BookingModal';

/* ─────────────── Lightbox ─────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm z-10">
        <span className="text-white/70 text-sm font-light tracking-wider">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-2 md:px-16">
        <img
          key={index}
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          style={{ animation: 'fadeIn 0.25s ease' }}
        />

        {/* Arrow buttons – hidden on mobile (swipe instead) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex-shrink-0 flex justify-center gap-2 py-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white w-5' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails – desktop only */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-shrink-0 justify-center gap-2 px-4 pb-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-16 h-16 shrink-0 rounded overflow-hidden border-2 transition-all ${
                i === index ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ─────────────── Room Card ─────────────── */
function RoomCard({ room, isAvailable, onBookNow }) {
  const defaultImage = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80';
  const mainImage = room.image_url || defaultImage;
  const allImages = Array.from(new Set([mainImage, ...(room.gallery || [])])).filter(Boolean);

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  const openLightbox = (idx) => { setLightboxStart(idx); setLightboxOpen(true); };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      {/* Image + Gallery */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] cursor-pointer overflow-hidden group"
        onClick={() => openLightbox(activeIdx)}
      >
        <img
          src={allImages[activeIdx]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
        {isAvailable && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-700 text-white shadow-md text-xs px-2 py-1">
              <Sparkles className="w-3 h-3 mr-1" /> Available
            </Badge>
          </div>
        )}
        {/* Image counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {activeIdx + 1}/{allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                activeIdx === i
                  ? 'border-amber-600 shadow-md ring-2 ring-amber-600/20'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{room.name}</h2>
          <div className="w-10 h-0.5 bg-amber-600 mt-2 mb-3" />
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {room.description || 'Experience comfort and tranquility in this beautifully designed room with modern amenities and stunning views.'}
          </p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          {room.bed_type && (
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-amber-700 shrink-0" /> {room.bed_type}
            </span>
          )}
          {room.max_guests && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-700 shrink-0" /> Up to {room.max_guests} guests
            </span>
          )}
          {room.view && (
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-700 shrink-0" /> {room.view}
            </span>
          )}
        </div>

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map((a, i) => (
              <span key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-light text-gray-900">₹{room.price_per_night?.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">per night</p>
          </div>
          {isAvailable ? (
            <Button
              onClick={() => onBookNow(room)}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              Book Now
            </Button>
          ) : (
            <div className="text-right">
              <p className="text-red-500 font-medium text-sm">Not Available</p>
              <p className="text-xs text-gray-400">Under renovation</p>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox images={allImages} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

/* ─────────────── Page ─────────────── */
export default function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: rooms = [], isLoading } = useQuery({ queryKey: ['rooms'], queryFn: RoomAPI.list });
  const { data: allBlockedDates = [] } = useQuery({ queryKey: ['all-blocked-dates'], queryFn: BlockedDateAPI.list });

  const isRoomAvailable = (roomId) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return !allBlockedDates.some(b => {
      if (b.room_id !== roomId) return false;
      const s = new Date(b.start_date); s.setHours(0,0,0,0);
      const e = new Date(b.end_date);   e.setHours(0,0,0,0);
      return today >= s && today <= e;
    });
  };

  const handleBookNow = async (room) => {
    if (!isRoomAvailable(room.id)) return;
    const ok = await auth.isAuthenticated();
    if (!ok) { auth.redirectToLogin(window.location.href); return; }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
          <p className="text-gray-500">Loading rooms…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="relative h-52 sm:h-72 md:h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex items-center justify-center text-white px-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-widest">OUR ROOMS</h1>
            <div className="w-16 h-px bg-white/60 mx-auto" />
            <p className="text-sm sm:text-base md:text-lg font-light text-white/85 max-w-xl">
              Thoughtfully designed spaces with comfort and stunning views
            </p>
          </div>
        </div>
      </div>

      {/* Room Cards */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-10">
        {rooms.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No rooms available at the moment.</div>
        ) : (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isAvailable={isRoomAvailable(room.id)}
              onBookNow={handleBookNow}
            />
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => { setShowBookingModal(false); setSelectedRoom(null); }}
        />
      )}
    </div>
  );
}