// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Heart, Calendar, MapPin, Phone, Mail } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

// interface SwipeableCardProps {
//   item: any;
//   type: 'ad' | 'event';
//   onLike: (id: string, type: string) => void;
//   onSwipeLeft: () => void;
//   onSwipeRight: () => void;
//   user?: any;
// }

// export default function SwipeableCard({ item, type, onLike, onSwipeLeft, onSwipeRight, user }: SwipeableCardProps) {
//   const [isLiked, setIsLiked] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);

//   const handleLike = () => {
//     if (!user) return;
//     setIsLiked(!isLiked);
//     onLike(item._id, type);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   return (
//     <motion.div
//       className="relative w-full h-[calc(100vh-200px)]"
//       drag="x"
//       dragConstraints={{ left: 0, right: 0 }}
//       dragElastic={0.5}
//       onDragEnd={(_, info) => {
//         if (info.offset.x > 100) {
//           setShowDetails(true);
//         } else if (info.offset.x < -100) {
//           onSwipeLeft();
//         }
//       }}
//     >
//       <Card className="w-full h-full overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-xl">
//         {/* Main Image */}
//         <div className="relative h-2/3">
//           {item.images && item.images.length > 0 ? (
//             <img
//               src={item.images[0]}
//               alt={item.title}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
//               <span className="text-white text-6xl font-bold opacity-30">
//                 {type === 'ad' ? '💼' : '🎉'}
//               </span>
//             </div>
//           )}

//           {/* Like Button */}
//           <Button
//             variant="outline"
//             size="icon"
//             className={`absolute top-4 right-4 rounded-full shadow-lg ${
//               isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 backdrop-blur-sm'
//             }`}
//             onClick={handleLike}
//           >
//             <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
//           </Button>

//           {/* Promoted Badge */}
//           {item.isPromoted && (
//             <Badge className="absolute top-4 left-4 bg-yellow-500 text-black">
//               ⭐ Promoted
//             </Badge>
//           )}
//         </div>

//         {/* Content */}
//         <CardContent className="p-6 h-1/3 overflow-hidden">
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex-1">
//               <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
//                 {item.title}
//               </h3>
//               <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
//                 <span className="flex items-center gap-1">
//                   <MapPin className="w-4 h-4" />
//                   {item.location}
//                 </span>
//                 {type === 'event' && (
//                   <span className="flex items-center gap-1">
//                     <Calendar className="w-4 h-4" />
//                     {formatDate(item.eventDate)}
//                   </span>
//                 )}
//               </div>
//             </div>
//             {type === 'ad' && item.price > 0 && (
//               <div className="text-right">
//                 <span className="text-2xl font-bold text-green-600">
//                   ₹{item.price.toLocaleString()}
//                 </span>
//               </div>
//             )}
//           </div>

//           <p className="text-gray-700 text-sm line-clamp-3 mb-4">
//             {item.shortDescription}
//           </p>

//           <div className="flex items-center justify-between">
//             <Badge variant="secondary">
//               {item.category}
//             </Badge>
//             <div className="flex items-center gap-2 text-xs text-gray-500">
//               <Heart className="w-4 h-4" />
//               {item.likes?.length || 0} likes
//             </div>
//           </div>
//         </CardContent>

//         {/* Swipe Indicators */}
//         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
//           <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
//           <div className="w-6 h-2 bg-blue-500 rounded-full"></div>
//           <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
//         </div>
//       </Card>

//       {/* Swipe Instructions */}
//       <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
//         <p className="text-sm text-gray-500">
//           ← Swipe left for next | Swipe right for details →
//         </p>
//       </div>

//       {/* Details Modal */}
//       {showDetails && (
//         <motion.div
//           initial={{ x: '100%' }}
//           animate={{ x: 0 }}
//           exit={{ x: '100%' }}
//           className="absolute inset-0 bg-white z-50 p-6 overflow-y-auto"
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold">{item.title}</h2>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setShowDetails(false)}
//             >
//               Close
//             </Button>
//           </div>

//           {item.images && item.images.length > 0 && (
//             <div className="mb-6">
//               <img
//                 src={item.images[0]}
//                 alt={item.title}
//                 className="w-full h-64 object-cover rounded-lg"
//               />
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <h3 className="font-semibold text-lg mb-2">Description</h3>
//               <p className="text-gray-700">{item.description}</p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <span className="font-semibold">Location:</span>
//                 <p>{item.location}</p>
//               </div>
//               <div>
//                 <span className="font-semibold">Category:</span>
//                 <p>{item.category}</p>
//               </div>
//             </div>

//             {type === 'event' && (
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <span className="font-semibold">Date:</span>
//                   <p>{formatDate(item.eventDate)}</p>
//                 </div>
//                 <div>
//                   <span className="font-semibold">Time:</span>
//                   <p>{item.eventTime}</p>
//                 </div>
//               </div>
//             )}

//             {type === 'event' && item.venue && (
//               <div>
//                 <span className="font-semibold">Venue:</span>
//                 <p>{item.venue}</p>
//               </div>
//             )}

//             {type === 'ad' && item.price > 0 && (
//               <div>
//                 <span className="font-semibold">Price:</span>
//                 <p className="text-2xl font-bold text-green-600">
//                   ₹{item.price.toLocaleString()}
//                 </p>
//               </div>
//             )}

//             {item.contact && (
//               <div>
//                 <h3 className="font-semibold text-lg mb-2">Contact</h3>
//                 <div className="space-y-2">
//                   {item.contact.phone && (
//                     <div className="flex items-center gap-2">
//                       <Phone className="w-4 h-4" />
//                       <a href={`tel:${item.contact.phone}`} className="text-blue-600">
//                         {item.contact.phone}
//                       </a>
//                     </div>
//                   )}
//                   {item.contact.email && (
//                     <div className="flex items-center gap-2">
//                       <Mail className="w-4 h-4" />
//                       <a href={`mailto:${item.contact.email}`} className="text-blue-600">
//                         {item.contact.email}
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="text-sm text-gray-500">
//               <p>Posted by: {item.createdBy?.name}</p>
//               <p>Posted on: {formatDate(item.createdAt)}</p>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// }

"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, Calendar, MapPin, Phone, Mail, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SwipeableCardProps {
  item: any;
  type: "ad" | "event";
  onLike: (id: string, type: string) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  user?: any;
}

export default function SwipeableCard({
  item,
  type,
  onLike,
  onSwipeLeft,
  onSwipeRight,
  user,
}: SwipeableCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Motion values for smooth animations
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for rotation and opacity based on drag distance
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  // Color overlays based on swipe direction
  const leftOverlayOpacity = useTransform(x, [-200, -50, 0], [0.8, 0.3, 0]);
  const rightOverlayOpacity = useTransform(x, [0, 50, 200], [0, 0.3, 0.8]);

  const handleLike = () => {
    if (!user) return;
    setIsLiked(!isLiked);
    onLike(item._id, type);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x);

    if (info.offset.x > threshold || velocity > 500) {
      // Swipe right - show details
      setShowDetails(true);
      x.set(0); // Reset position
    } else if (info.offset.x < -threshold || velocity > 500) {
      // Swipe left - next card
      onSwipeLeft();
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] flex items-center justify-center">
      <motion.div
        className="relative w-full max-w-sm h-full"
        style={{ x, y, rotate, opacity, scale }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        animate={{ scale: showDetails ? 0 : 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Left Swipe Overlay (Pass/Skip) */}
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
          style={{ opacity: leftOverlayOpacity }}
        >
          <div className="flex flex-col items-center text-white">
            <X className="w-16 h-16 mb-2" strokeWidth={3} />
            <span className="text-2xl font-bold">PASS</span>
          </div>
        </motion.div>

        {/* Right Swipe Overlay (Details) */}
        <motion.div
          className="absolute inset-0 bg-blue-500 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
          style={{ opacity: rightOverlayOpacity }}
        >
          <div className="flex flex-col items-center text-white">
            <Check className="w-16 h-16 mb-2" strokeWidth={3} />
            <span className="text-2xl font-bold">DETAILS</span>
          </div>
        </motion.div>

        <Card className="w-full h-full overflow-hidden bg-white shadow-2xl rounded-2xl border-0">
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
                  {type === "ad" ? "💼" : "🎉"}
                </span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Like Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6"
            >
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full shadow-lg border-2 backdrop-blur-sm transition-all duration-300 ${
                  isLiked
                    ? "bg-red-500 text-white border-red-500 shadow-red-500/25"
                    : "bg-white/90 hover:bg-white border-white/50"
                }`}
                onClick={handleLike}
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    isLiked ? "fill-current scale-110" : ""
                  }`}
                />
              </Button>
            </motion.div>

            {/* Promoted Badge */}
            {item.isPromoted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-6 left-6"
              >
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg">
                  ⭐ Promoted
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-6 h-1/3 overflow-hidden bg-gradient-to-b from-white to-gray-50">
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
                  {type === "event" && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(item.eventDate)}
                    </span>
                  )}
                </div>
              </div>
              {type === "ad" && item.price > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-sm line-clamp-3 mb-4 leading-relaxed">
              {item.shortDescription}
            </p>

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {item.category}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Heart className="w-4 h-4" />
                {item.likes?.length || 0} likes
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Swipe Instructions */}
      <motion.div
        className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-red-500" />
            </div>
            <span>Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-blue-500" />
            </div>
            <span>Details</span>
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      {showDetails && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-0 bg-white z-50 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="p-6">
              {item.images && item.images.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </motion.div>
              )}

              <motion.div
                className="space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-900">
                      Location
                    </span>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {item.location}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-900">
                      Category
                    </span>
                    <p className="text-gray-700">{item.category}</p>
                  </div>
                </div>

                {type === "event" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="font-semibold text-gray-900">Date</span>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDate(item.eventDate)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="font-semibold text-gray-900">Time</span>
                      <p className="text-gray-700">{item.eventTime}</p>
                    </div>
                  </div>
                )}

                {type === "event" && item.venue && (
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-900">Venue</span>
                    <p className="text-gray-700">{item.venue}</p>
                  </div>
                )}

                {type === "ad" && item.price > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="font-semibold text-gray-900 block mb-1">
                      Price
                    </span>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                )}

                {item.contact && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      {item.contact.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <a
                            href={`tel:${item.contact.phone}`}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            {item.contact.phone}
                          </a>
                        </div>
                      )}
                      {item.contact.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <a
                            href={`mailto:${item.contact.email}`}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            {item.contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 text-sm text-gray-500 space-y-1">
                  <p>
                    Posted by:{" "}
                    <span className="font-medium">{item.createdBy?.name}</span>
                  </p>
                  <p>
                    Posted on:{" "}
                    <span className="font-medium">
                      {formatDate(item.createdAt)}
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
