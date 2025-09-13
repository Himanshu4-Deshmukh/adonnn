"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  User,
  Search,
  Plus,
  Calendar,
  ShoppingBag,
  UserCircle,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import SwipeableCard from "@/components/SwipeableCard";
import CreateModal from "@/components/CreateModal";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<"ads" | "events">("ads");
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const { toast } = useToast();

  const locations = [
    "all",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
  ];

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentTab, selectedLocation]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = currentTab === "ads" ? "/api/ads" : "/api/events";
      const params = new URLSearchParams();
      if (selectedLocation !== "all") {
        params.append("location", selectedLocation);
      }

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data[currentTab] || []);
        setCurrentIndex(0);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (itemId: string, type: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, type }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to like item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error liking item:", error);
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "No more items",
        description: `You've seen all ${currentTab}!`,
      });
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCreateModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">LA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Location Filter */}
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-28 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === "all" ? "All" : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
              >
                <User className="w-4 h-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 pb-24">
        {/* Cards Container */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {currentTab} found
            </h3>
            <p className="text-gray-500 mb-6">
              Be the first to create a {currentTab.slice(0, -1)} in your area!
            </p>
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create {currentTab === "ads" ? "Ad" : "Event"}
            </Button>
          </div>
        ) : (
          currentItem && (
            <SwipeableCard
              item={currentItem}
              type={currentTab === "ads" ? "ad" : "event"}
              onLike={handleLike}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={() => {}}
              user={user}
            />
          )
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around py-3">
          <Button
            variant={currentTab === "ads" ? "default" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2"
            onClick={() => setCurrentTab("ads")}
          >
            <ShoppingBag className="w-5 h-5 mb-1" />
            <span className="text-xs">Ads</span>
          </Button>

          <Button
            variant={currentTab === "events" ? "default" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2"
            onClick={() => setCurrentTab("events")}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-xs">Events</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-col h-auto py-2 border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={handleCreateClick}
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs">Create</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2"
            onClick={() => (user ? setUser(null) : setAuthModalOpen(true))}
          >
            <UserCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={setUser}
      />

      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        type={currentTab === "ads" ? "ad" : "event"}
        onSuccess={() => {
          fetchItems();
          toast({
            title: "Success",
            description: `${
              currentTab === "ads" ? "Ad" : "Event"
            } created successfully!`,
          });
        }}
      />

      <Toaster />
    </div>
  );
}
