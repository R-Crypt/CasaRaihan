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
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    number_of_guests: 1,
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
    return nights > 0 ? nights * room.price_per_night : 0;
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

    const nights = differenceInDays(checkOut, checkIn);
    const totalAmount = nights * room.price_per_night;

    const bookingData = {
      room_id: room.id,
      room_name: room.name,
      user_id: currentUser?.id,
      ...formData,
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
            <p className="text-amber-700 font-medium">₹{room.price_per_night} per night</p>
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
                        onChange={(e) => setFormData({...formData, number_of_guests: parseInt(e.target.value)})}
                        required
                      />
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
                <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-gray-800">Booking Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">₹{room.price_per_night} × {totalNights} night{totalNights > 1 ? 's' : ''}</span>
                    <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-800">Total Amount</span>
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