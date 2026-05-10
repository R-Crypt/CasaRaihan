import React, { useState } from 'react';
import { auth, RoomAPI, BookingAPI, BlockedDateAPI, SettingsAPI, CoreAPI } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Save, X, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminRooms() {
  const [editingRoom, setEditingRoom] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => RoomAPI.list(),
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => RoomAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingRoom(null);
      setEditData({});
      showSuccess('Room updated successfully!');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => RoomAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      showSuccess('Room deleted successfully!');
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => RoomAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setShowAddForm(false);
      setEditData({});
      showSuccess('Room added successfully!');
    },
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (room) => {
    setEditingRoom(room.id);
    setEditData({
      ...room,
      gallery: room.gallery || []
    });
  };

  const handleSave = (roomId) => {
    updateRoomMutation.mutate({ id: roomId, data: editData });
  };

  const handleCancel = () => {
    setEditingRoom(null);
    setEditData({});
  };

  const handleDelete = (roomId, roomName) => {
    if (window.confirm(`Are you sure you want to delete "${roomName}"? This action cannot be undone.`)) {
      deleteRoomMutation.mutate(roomId);
    }
  };

  const handleAddRoom = () => {
    setShowAddForm(true);
    setEditData({
      name: '',
      type: 'Budget Room',
      description: '',
      price_per_night: 0,
      bed_type: '',
      view: '',
      max_guests: 1,
      amenities: [],
      image_url: '',
      gallery: []
    });
  };

  const handleCreateRoom = () => {
    if (!editData.name || !editData.price_per_night) {
      alert('Please fill in at least the room name and price');
      return;
    }
    createRoomMutation.mutate(editData);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const result = await CoreAPI.UploadFile({ file });
    setUploadingImage(false);

    if (type === 'main') {
      setEditData({...editData, image_url: result.file_url});
    } else if (type === 'gallery') {
      const gallery = editData.gallery || [];
      setEditData({...editData, gallery: [...gallery, result.file_url]});
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const gallery = [...editData.gallery];
    gallery.splice(index, 1);
    setEditData({...editData, gallery});
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Manage Rooms</h3>
        <Button onClick={handleAddRoom} className="bg-amber-700 hover:bg-amber-800">
          <Plus className="w-4 h-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Add New Room</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateRoom} disabled={createRoomMutation.isPending}>
                  <Save className="w-4 h-4 mr-1" />
                  {createRoomMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setEditData({});
                }}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Name *</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder="e.g., Deluxe Suite"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price per Night (₹) *</Label>
                  <Input
                    type="number"
                    value={editData.price_per_night}
                    onChange={(e) => setEditData({...editData, price_per_night: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Input
                    value={editData.type}
                    onChange={(e) => setEditData({...editData, type: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bed Type</Label>
                  <Input
                    value={editData.bed_type}
                    onChange={(e) => setEditData({...editData, bed_type: e.target.value})}
                    placeholder="e.g., 1 King Bed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Guests</Label>
                  <Input
                    type="number"
                    value={editData.max_guests}
                    onChange={(e) => setEditData({...editData, max_guests: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>View</Label>
                  <Input
                    value={editData.view}
                    onChange={(e) => setEditData({...editData, view: e.target.value})}
                    placeholder="e.g., Valley View"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                  placeholder="Describe the room..."
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Room Images
                </h4>
                
                <div className="space-y-2">
                  <Label>Main Image</Label>
                  <div className="flex gap-4 items-center">
                    {editData.image_url && (
                      <img src={editData.image_url} alt="Main" className="w-32 h-24 object-cover rounded" />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'main')}
                        disabled={uploadingImage}
                        className="mb-2"
                      />
                      {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    {editData.gallery?.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Gallery ${index + 1}`} className="w-32 h-24 object-cover rounded" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => handleRemoveGalleryImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                    disabled={uploadingImage}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {rooms.map((room) => (
        <Card key={room.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{room.name}</CardTitle>
              {editingRoom === room.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(room.id)} disabled={updateRoomMutation.isPending}>
                    <Save className="w-4 h-4 mr-1" />
                    {updateRoomMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(room.id, room.name)}
                    disabled={deleteRoomMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingRoom === room.id ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Name</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Night (₹)</Label>
                    <Input
                      type="number"
                      value={editData.price_per_night}
                      onChange={(e) => setEditData({...editData, price_per_night: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bed Type</Label>
                    <Input
                      value={editData.bed_type}
                      onChange={(e) => setEditData({...editData, bed_type: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Guests</Label>
                    <Input
                      type="number"
                      value={editData.max_guests}
                      onChange={(e) => setEditData({...editData, max_guests: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>View</Label>
                    <Input
                      value={editData.view}
                      onChange={(e) => setEditData({...editData, view: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Room Images
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Main Image</Label>
                    <div className="flex gap-4 items-center">
                      {editData.image_url && (
                        <img src={editData.image_url} alt="Main" className="w-32 h-24 object-cover rounded" />
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'main')}
                          disabled={uploadingImage}
                          className="mb-2"
                        />
                        {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gallery Images</Label>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {editData.gallery?.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Gallery ${index + 1}`} className="w-32 h-24 object-cover rounded" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => handleRemoveGalleryImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'gallery')}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {room.image_url && (
                  <img src={room.image_url} alt={room.name} className="w-full h-48 object-cover rounded" />
                )}
                <p className="text-gray-600">{room.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Badge variant="secondary">₹{room.price_per_night}/night</Badge>
                  {room.bed_type && <Badge variant="secondary">{room.bed_type}</Badge>}
                  {room.view && <Badge variant="secondary">{room.view}</Badge>}
                  <Badge variant="secondary">Up to {room.max_guests} guests</Badge>
                </div>
                {room.gallery && room.gallery.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{room.gallery.length} gallery image{room.gallery.length > 1 ? 's' : ''}</p>
                    <div className="flex flex-wrap gap-2">
                      {room.gallery.slice(0, 4).map((url, index) => (
                        <img key={index} src={url} alt={`Gallery ${index + 1}`} className="w-20 h-16 object-cover rounded" />
                      ))}
                      {room.gallery.length > 4 && (
                        <div className="w-20 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                          +{room.gallery.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}