'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SwipeableCardProps {
  item: any;
  type: 'ad' | 'event';
  onLike: (id: string, type: string) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  user?: any;
}

export default function SwipeableCard({ item, type, onLike, onSwipeLeft, onSwipeRight, user }: SwipeableCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleLike = () => {
    if (!user) return;
    setIsLiked(!isLiked);
    onLike(item._id, type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      className="relative w-full h-[calc(100vh-200px)]"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          setShowDetails(true);
        } else if (info.offset.x < -100) {
          onSwipeLeft();
        }
      }}
    >
      <Card className="w-full h-full overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-xl">
        {/* Main Image */}
        <div className="relative h-2/3">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-30">
                {type === 'ad' ? '💼' : '🎉'}
              </span>
            </div>
          )}
          
          {/* Like Button */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-4 right-4 rounded-full shadow-lg ${
              isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 backdrop-blur-sm'
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>

          {/* Promoted Badge */}
          {item.isPromoted && (
            <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
              ⭐ Promoted
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-6 h-1/3 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                {item.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </span>
                {type === 'event' && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.eventDate)}
                  </span>
                )}
              </div>
            </div>
            {type === 'ad' && item.price > 0 && (
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">
                  ₹{item.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm line-clamp-3 mb-4">
            {item.shortDescription}
          </p>

          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {item.category}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Heart className="w-4 h-4" />
              {item.likes?.length || 0} likes
            </div>
          </div>
        </CardContent>

        {/* Swipe Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-6 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </Card>

      {/* Swipe Instructions */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">
          ← Swipe left for next | Swipe right for details →
        </p>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute inset-0 bg-white z-50 p-6 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
          </div>

          {item.images && item.images.length > 0 && (
            <div className="mb-6">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Location:</span>
                <p>{item.location}</p>
              </div>
              <div>
                <span className="font-semibold">Category:</span>
                <p>{item.category}</p>
              </div>
            </div>

            {type === 'event' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Date:</span>
                  <p>{formatDate(item.eventDate)}</p>
                </div>
                <div>
                  <span className="font-semibold">Time:</span>
                  <p>{item.eventTime}</p>
                </div>
              </div>
            )}

            {type === 'event' && item.venue && (
              <div>
                <span className="font-semibold">Venue:</span>
                <p>{item.venue}</p>
              </div>
            )}

            {type === 'ad' && item.price > 0 && (
              <div>
                <span className="font-semibold">Price:</span>
                <p className="text-2xl font-bold text-green-600">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>
            )}

            {item.contact && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact</h3>
                <div className="space-y-2">
                  {item.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${item.contact.phone}`} className="text-blue-600">
                        {item.contact.phone}
                      </a>
                    </div>
                  )}
                  {item.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${item.contact.email}`} className="text-blue-600">
                        {item.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Posted by: {item.createdBy?.name}</p>
              <p>Posted on: {formatDate(item.createdAt)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}