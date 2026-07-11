import React, { useState } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import RoomCalendar from './RoomCalendar';

export default function BookingModal({ room, onClose }) {
  const isFamilySuite = room.name.toLowerCase().includes('family suite');
  const minCapacity = isFamilySuite ? 6 : 2;

  const [currentUser, setCurrentUser] = useState(null);
  const [hasAC, setHasAC] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    number_of_guests: minCapacity,
    special_requests: ''
  });
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load current user and pre-fill form
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await auth.me();
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          guest_name: user.full_name || '',
          guest_email: user.email,
        }));
      } catch (error) {
        // User not logged in - redirect to login
        setError('Please log in to make a booking');
      }
    };
    loadUser();
  }, []);

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings', room.id],
    queryFn: () => BookingAPI.filter({ room_id: room.id }),
  });

  const { data: blockedDates = [] } = useQuery({
    queryKey: ['blocked-dates', room.id],
    queryFn: () => BlockedDateAPI.filter({ room_id: room.id }),
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      // 1. Save booking to database
      const booking = await BookingAPI.create(bookingData);

      // 2. Fire email + SMS notifications (non-blocking – won't fail the booking)
      try {
        await CoreAPI.SendEmail({
          // Re-using the existing edge-function call signature so it goes to notify-booking
          _edge_function: 'notify-booking',
          guest_name: bookingData.guest_name,
          guest_email: bookingData.guest_email,
          guest_phone: bookingData.guest_phone,
          room_name: bookingData.room_name,
          check_in: bookingData.check_in,
          check_out: bookingData.check_out,
          total_nights: bookingData.total_nights,
          total_amount: bookingData.total_amount,
          number_of_guests: bookingData.number_of_guests,
          special_requests: bookingData.special_requests,
        });
      } catch (notifyErr) {
        console.warn('Notification failed (booking still saved):', notifyErr);
      }

      return booking;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => { onClose(); }, 3000);
    },
    onError: () => {
      setError('Failed to create booking. Please try again.');
    }
  });

  const isRoomAvailable = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return true;
    
    const newCheckIn = parseISO(checkIn);
    const newCheckOut = parseISO(checkOut);

    // Check against existing bookings
    const hasBookingConflict = existingBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingCheckIn = parseISO(booking.check_in);
      const bookingCheckOut = parseISO(booking.check_out);

      return (
        (newCheckIn >= bookingCheckIn && newCheckIn < bookingCheckOut) ||
        (newCheckOut > bookingCheckIn && newCheckOut <= bookingCheckOut) ||
        (newCheckIn <= bookingCheckIn && newCheckOut >= bookingCheckOut)
      );
    });

    // Check against blocked dates
    const hasBlockedDateConflict = blockedDates.some(block => {
      const blockStart = parseISO(block.start_date);
      const blockEnd = parseISO(block.end_date);

      return (
        (newCheckIn >= blockStart && newCheckIn <= blockEnd) ||
        (newCheckOut >= blockStart && newCheckOut <= blockEnd) ||
        (newCheckIn <= blockStart && newCheckOut >= blockEnd)
      );
    });

    return !hasBookingConflict && !hasBlockedDateConflict;
  };

  const calculateTotal = () => {
    if (!formData.check_in || !formData.check_out) return 0;
    const nights = differenceInDays(parseISO(formData.check_out), parseISO(formData.check_in));
    if (nights <= 0) return 0;
    
    const ratePerPerson = hasAC ? 700 : 600;
    const chargeableGuests = Math.max(minCapacity, formData.number_of_guests || 0);
    return nights * chargeableGuests * ratePerPerson;
  };

  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
    if (dates.checkIn) {
      setFormData({
        ...formData, 
        check_in: format(dates.checkIn, 'yyyy-MM-dd'),
        check_out: dates.checkOut ? format(dates.checkOut, 'yyyy-MM-dd') : ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!currentUser) {
      setError('Please log in to make a booking');
      auth.redirectToLogin();
      return;
    }

    if (!formData.guest_phone) {
      setError('Please enter your phone number');
      return;
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    const checkIn = parseISO(formData.check_in);
    const checkOut = parseISO(formData.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (!isRoomAvailable(formData.check_in, formData.check_out)) {
      setError('This room is not available for the selected dates. Please choose different dates.');
      return;
    }

    const maxCapacity = Number(room.max_guests) || 10;
    const selectedGuests = Number(formData.number_of_guests) || 0;
    if (selectedGuests > maxCapacity) {
      setError(`Maximum capacity for this room is ${maxCapacity} guests.`);
      return;
    }

    const nights = differenceInDays(checkOut, checkIn);
    const ratePerPerson = hasAC ? 700 : 600;
    const chargeableGuests = Math.max(minCapacity, formData.number_of_guests || 0);
    const totalAmount = nights * chargeableGuests * ratePerPerson;

    // Format special requests to include A/C choice for admin visibility
    const acPrefix = `[A/C OPTION: ${hasAC ? 'With A/C' : 'Without A/C'}]`;
    const finalSpecialRequests = formData.special_requests 
      ? `${acPrefix}\n${formData.special_requests}`
      : acPrefix;

    const bookingData = {
      room_id: room.id,
      room_name: `${room.name} (${hasAC ? 'A/C' : 'Non-A/C'})`,
      user_id: currentUser?.id,
      ...formData,
      special_requests: finalSpecialRequests,
      total_nights: nights,
      total_amount: totalAmount,
      status: 'pending'
    };

    createBookingMutation.mutate(bookingData);
  };

  const totalNights = formData.check_in && formData.check_out 
    ? differenceInDays(parseISO(formData.check_out), parseISO(formData.check_in))
    : 0;

  const totalAmount = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-light text-gray-800">{room.name}</h2>
            <p className="text-amber-700 font-medium text-sm">
              ₹600 (Non-A/C) / ₹700 (A/C) per person per night
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800">Booking Confirmed!</h3>
              <p className="text-gray-600">
                Thank you for your booking. We've sent a confirmation to your email and notified the property owner.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {currentUser && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">Booking for:</p>
                    <p className="font-medium text-gray-800">{currentUser.full_name}</p>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="guest_phone">Phone Number *</Label>
                      <Input
                        id="guest_phone"
                        type="tel"
                        value={formData.guest_phone}
                        onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number_of_guests">Number of Guests *</Label>
                      <Input
                        id="number_of_guests"
                        type="number"
                        min="1"
                        max={room.max_guests || 10}
                        value={formData.number_of_guests}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData({...formData, number_of_guests: val});
                          const maxCap = Number(room.max_guests) || 10;
                          if (val > maxCap) {
                            setError(`Maximum capacity for this room is ${maxCap} guests.`);
                          } else {
                            setError('');
                          }
                        }}
                        required
                      />
                      {formData.number_of_guests < minCapacity && (
                        <p className="text-[11px] text-amber-700 font-medium">
                          Note: Minimum charge for {minCapacity} guests will apply.
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500">
                        Max capacity: {room.max_guests || 10} guests.
                      </p>
                    </div>
                  </div>

                  {/* Room Comfort Option Selector */}
                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium">Room Comfort Option *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setHasAC(false)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                          !hasAC
                            ? 'border-amber-700 bg-amber-50/50 ring-2 ring-amber-700/20 text-amber-900 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        <span className="font-semibold text-sm">Without A/C</span>
                        <span className="text-[11px] text-gray-500 mt-1">₹600 / person / night</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHasAC(true)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                          hasAC
                            ? 'border-amber-700 bg-amber-50/50 ring-2 ring-amber-700/20 text-amber-900 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        <span className="font-semibold text-sm">With A/C</span>
                        <span className="text-[11px] text-gray-500 mt-1">₹700 / person / night</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <RoomCalendar
                selectedDates={selectedDates}
                onSelectDates={handleDateSelect}
                bookedDates={existingBookings}
                blockedDates={blockedDates}
              />

              <div className="space-y-2">
                <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                <Textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>

              {/* Summary */}
              {totalNights > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg space-y-2 border border-amber-200/50">
                  <h4 className="font-medium text-gray-800 text-sm">Price Breakdown</h4>
                  
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Comfort option:</span>
                      <span className="font-medium text-gray-800">{hasAC ? 'With A/C' : 'Without A/C'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per person / night:</span>
                      <span className="font-medium text-gray-800">₹{hasAC ? 700 : 600}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests count:</span>
                      <span className="font-medium text-gray-800">
                        {formData.number_of_guests} {formData.number_of_guests < minCapacity && `(Charged for minimum ${minCapacity})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per night:</span>
                      <span className="font-medium text-gray-800">₹{(Math.max(minCapacity, formData.number_of_guests) * (hasAC ? 700 : 600)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span className="font-medium text-gray-800">{totalNights} night{totalNights > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="border-t border-amber-200/60 pt-2 flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-800 text-sm">Total Amount</span>
                    <span className="font-bold text-amber-700 text-lg">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {currentUser ? (
                  <Button 
                    type="submit" 
                    className="flex-1 bg-amber-700 hover:bg-amber-800"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => auth.redirectToLogin()}
                    className="flex-1 bg-amber-700 hover:bg-amber-800"
                  >
                    Log In to Book
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}