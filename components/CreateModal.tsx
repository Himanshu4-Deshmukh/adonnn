'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ad' | 'event';
  onSuccess: () => void;
}

export default function CreateModal({ isOpen, onClose, type, onSuccess }: CreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    location: '',
    category: '',
    price: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const categories = type === 'ad' 
    ? ['Electronics', 'Vehicles', 'Real Estate', 'Jobs', 'Services', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Others']
    : ['Music', 'Sports', 'Business', 'Education', 'Entertainment', 'Community', 'Food & Drink', 'Arts', 'Technology', 'Others'];

  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadPromises = images.map(async (image) => {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      return data.imageUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.shortDescription || 
        !formData.location || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'event' && (!formData.eventDate || !formData.eventTime || !formData.venue)) {
      toast({
        title: 'Error',
        description: 'Please fill in all event details',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Prepare payload
      const payload: any = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        location: formData.location,
        category: formData.category,
        images: imageUrls,
        contact: {
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      };

      if (type === 'ad') {
        payload.price = formData.price ? parseFloat(formData.price) : 0;
      } else {
        payload.eventDate = formData.eventDate;
        payload.eventTime = formData.eventTime;
        payload.venue = formData.venue;
      }

      // Submit to API
      const response = await fetch(`/api/${type}s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${type === 'ad' ? 'Ad' : 'Event'} created successfully!`,
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: data.error || `Failed to create ${type}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      location: '',
      category: '',
      price: '',
      eventDate: '',
      eventTime: '',
      venue: '',
      contactPhone: '',
      contactEmail: '',
    });
    setImages([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New {type === 'ad' ? 'Advertisement' : 'Event'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a catchy title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief description (max 100 characters)"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information"
                rows={4}
              />
            </div>
          </div>

          {/* Location and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ad-specific fields */}
          {type === 'ad' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price (0 for free)"
              />
            </div>
          )}

          {/* Event-specific fields */}
          {type === 'event' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Event Time *</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Event venue address"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Contact phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Contact email address"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images (Optional, max 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload images</p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
              {uploading ? 'Creating...' : `Create ${type === 'ad' ? 'Ad' : 'Event'}`}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}