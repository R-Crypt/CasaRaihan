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

      // Send email notification to admin
      await CoreAPI.SendEmail({
        from_name: 'Casa Raihan Booking System',
        to: 'rayaankhaaan@gmail.com',
        subject: `🚫 Booking Cancelled: ${booking.room_name}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                🚫 Booking Cancellation Notice
              </h2>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #fee2e2; border-left: 4px solid #dc2626; border-radius: 4px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0;">Cancelled Booking Details</h3>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Room:</strong> ${booking.room_name}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Check-in:</strong> ${format(parseISO(booking.check_in), 'PPP')}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Check-out:</strong> ${format(parseISO(booking.check_out), 'PPP')}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Total Nights:</strong> ${booking.total_nights}</p>
              </div>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">Guest Information</h3>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Name:</strong> ${booking.guest_name}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> <a href="mailto:${booking.guest_email}" style="color: #3b82f6;">${booking.guest_email}</a></p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Phone:</strong> <a href="tel:${booking.guest_phone}" style="color: #3b82f6;">${booking.guest_phone}</a></p>
              </div>
              
              <div style="margin: 20px 0; padding: 20px; background-color: #fee2e2; border-radius: 4px; text-align: center;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0;">Refund Amount</h3>
                <p style="font-size: 32px; font-weight: bold; color: #991b1b; margin: 0;">₹${booking.total_amount.toLocaleString()}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>This booking was cancelled by the guest through their profile.</p>
              </div>
            </div>
          </div>
        `
      });

      // Send email to guest
      await CoreAPI.SendEmail({
        from_name: 'Casa Raihan Homestay',
        to: booking.guest_email,
        subject: 'Booking Cancellation Confirmation',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Your Booking Has Been Cancelled</h2>
              <p style="color: #1f2937;">Dear ${booking.guest_name},</p>
              <p style="color: #1f2937;">Your booking has been successfully cancelled.</p>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="color: #991b1b; margin-top: 0;">Booking Details</h3>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Room:</strong> ${booking.room_name}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Check-in:</strong> ${format(parseISO(booking.check_in), 'PPP')}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Check-out:</strong> ${format(parseISO(booking.check_out), 'PPP')}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Refund Amount:</strong> ₹${booking.total_amount.toLocaleString()}</p>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">Need Help?</h3>
                <p style="margin: 5px 0; color: #1f2937;">If you have any questions, please contact us:</p>
                <p style="margin: 5px 0; color: #1f2937;">📞 <a href="tel:+918904408202" style="color: #92400e;">+91 8904408202</a></p>
                <p style="margin: 5px 0; color: #1f2937;">📧 <a href="mailto:rayaankhaaan@gmail.com" style="color: #92400e;">rayaankhaaan@gmail.com</a></p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                We hope to welcome you at Casa Raihan Homestay in the future!
              </p>
            </div>
          </div>
        `
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