import React, { useState } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, Mail, Phone, MapPin, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings', user?.email],
    queryFn: async () => {
      // Get all bookings created by this user OR with their email as guest
      const allBookings = await BookingAPI.list();
      return allBookings.filter(b => 
        b.created_by === user.email || b.guest_email === user.email
      );
    },
    enabled: !!user,
  });

  const [successMessage, setSuccessMessage] = useState('');

  const cancelBookingMutation = useMutation({
    mutationFn: async (booking) => {
      // Update booking status
      await BookingAPI.update(booking.id, { status: 'cancelled' });

      // Send cancellation emails via edge function
      await CoreAPI.SendEmail({
        _edge_function: 'notify-booking',
        action: 'cancellation',
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        room_name: booking.room_name,
        check_in: booking.check_in,
        check_out: booking.check_out,
        total_nights: booking.total_nights,
        total_amount: booking.total_amount,
        number_of_guests: booking.number_of_guests,
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      setSuccessMessage('Your booking has been cancelled successfully. Confirmation emails have been sent.');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error) => {
      alert('Failed to cancel booking. Please try again or contact us directly.');
    }
  });

  const handleLogout = () => {
    auth.logout();
  };

  if (loading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <Button onClick={() => auth.redirectToLogin()}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status !== 'cancelled' && new Date(b.check_in) >= new Date());
  const pastBookings = bookings.filter(b => b.status !== 'cancelled' && new Date(b.check_in) < new Date());
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.full_name || 'Guest User'}</CardTitle>
                  <p className="text-gray-600">{user.email}</p>
                  {user.role === 'admin' && (
                    <Badge className="mt-2 bg-amber-700">Admin</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-2xl font-light text-gray-800 mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-medium text-gray-800">{booking.room_name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(parseISO(booking.check_in), 'PPP')} - {format(parseISO(booking.check_out), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{booking.number_of_guests} guest{booking.number_of_guests > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-amber-700">₹{booking.total_amount.toLocaleString()}</p>
                        <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking? You will receive a confirmation email.')) {
                            cancelBookingMutation.mutate(booking);
                          }
                        }}
                        disabled={cancelBookingMutation.isPending}
                        className="whitespace-nowrap"
                      >
                        {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Past Bookings</h2>
            <div className="grid gap-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="opacity-75">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-gray-800">{booking.room_name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(parseISO(booking.check_in), 'PPP')} - {format(parseISO(booking.check_out), 'PPP')}</span>
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-700">₹{booking.total_amount.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Bookings */}
        {cancelledBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">Cancelled Bookings</h2>
            <div className="grid gap-4">
              {cancelledBookings.map((booking) => (
                <Card key={booking.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-medium text-gray-800">{booking.room_name}</h3>
                        <Badge variant="destructive">Cancelled</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(parseISO(booking.check_in), 'PPP')} - {format(parseISO(booking.check_out), 'PPP')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}