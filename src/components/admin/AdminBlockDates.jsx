import React, { useState } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminBlockDates() {
  const [formData, setFormData] = useState({
    room_id: '',
    room_name: '',
    start_date: '',
    end_date: '',
    reason: 'Renovation'
  });
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => RoomAPI.list(),
  });

  const { data: blockedDates = [] } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: () => BlockedDateAPI.list(),
  });

  const createBlockMutation = useMutation({
    mutationFn: (data) => BlockedDateAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      setFormData({
        room_id: '',
        room_name: '',
        start_date: '',
        end_date: '',
        reason: 'Renovation'
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => BlockedDateAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });

  const handleRoomSelect = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    setFormData({
      ...formData,
      room_id: roomId,
      room_name: room?.name || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.room_id || !formData.start_date || !formData.end_date) {
      alert('Please fill in all required fields');
      return;
    }
    createBlockMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Block Dates for Renovation/Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Room *</Label>
                <Select value={formData.room_id} onValueChange={handleRoomSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g., Renovation, Maintenance"
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  min={formData.start_date || format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="bg-amber-700 hover:bg-amber-800"
              disabled={createBlockMutation.isPending}
            >
              {createBlockMutation.isPending ? 'Blocking...' : 'Block Dates'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedDates.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No blocked dates</p>
          ) : (
            <div className="space-y-3">
              {blockedDates.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800">{block.room_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(parseISO(block.start_date), 'PPP')} - {format(parseISO(block.end_date), 'PPP')}</span>
                    </div>
                    {block.reason && (
                      <Badge variant="secondary" className="text-xs">{block.reason}</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Remove this date block?')) {
                        deleteBlockMutation.mutate(block.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}