import React from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Mail, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => BookingAPI.list('-created_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => BookingAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const BookingCard = ({ booking }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-800">{booking.room_name}</h3>
              <Badge className={
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {booking.status}
              </Badge>
            </div>
            {booking.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{booking.guest_name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${booking.guest_email}`} className="text-blue-600 hover:underline">
                  {booking.guest_email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${booking.guest_phone}`} className="text-blue-600 hover:underline">
                  {booking.guest_phone}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Check-in: {format(parseISO(booking.check_in), 'PP')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Check-out: {format(parseISO(booking.check_out), 'PP')}</span>
              </div>
              <p className="font-medium text-amber-700">₹{booking.total_amount.toLocaleString()}</p>
            </div>
          </div>

          {booking.special_requests && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600"><strong>Special Requests:</strong> {booking.special_requests}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-xl font-medium text-gray-800 mb-4">Pending Bookings ({pendingBookings.length})</h3>
          <div className="space-y-4">
            {pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {confirmedBookings.length > 0 && (
        <div>
          <h3 className="text-xl font-medium text-gray-800 mb-4">Confirmed Bookings ({confirmedBookings.length})</h3>
          <div className="space-y-4">
            {confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {cancelledBookings.length > 0 && (
        <div>
          <h3 className="text-xl font-medium text-gray-800 mb-4">Cancelled Bookings ({cancelledBookings.length})</h3>
          <div className="space-y-4">
            {cancelledBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No bookings yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}