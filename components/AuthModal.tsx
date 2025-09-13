'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const { toast } = useToast();

  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];

  const sendOTP = async () => {
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        toast({
          title: 'OTP Sent!',
          description: `OTP sent to ${phone}. ${data.developmentOtp ? `Development OTP: ${data.developmentOtp}` : ''}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = { phone, otp };
      
      if (requiresRegistration || step === 'register') {
        if (!name.trim() || !location.trim()) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in your name and location',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        payload.name = name.trim();
        payload.location = location.trim();
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
        });
        onSuccess(data.user);
        onClose();
        resetForm();
      } else {
        if (data.requiresRegistration) {
          setRequiresRegistration(true);
          setStep('register');
          toast({
            title: 'Registration Required',
            description: 'Please complete your profile to continue',
          });
        } else {
          toast({
            title: 'Verification Failed',
            description: data.error || 'Invalid OTP. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setLocation('');
    setRequiresRegistration(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'phone' && (
              <>
                <Phone className="w-5 h-5" />
                Login / Sign Up
              </>
            )}
            {step === 'otp' && (
              <>
                <Shield className="w-5 h-5" />
                Verify OTP
              </>
            )}
            {step === 'register' && (
              <>
                <Shield className="w-5 h-5" />
                Complete Registration
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhone(value);
                    }
                  }}
                  maxLength={10}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  We'll send you an OTP to verify your number
                </p>
              </div>
              <Button 
                onClick={sendOTP} 
                disabled={loading || phone.length !== 10} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  maxLength={6}
                  className="text-lg text-center tracking-widest"
                />
                <p className="text-sm text-gray-500">
                  OTP sent to {phone}
                </p>
              </div>
              <Button 
                onClick={verifyOTP} 
                disabled={loading || otp.length !== 6} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')} 
                className="w-full"
                disabled={loading}
              >
                Change Phone Number
              </Button>
            </>
          )}

          {step === 'register' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your city</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button 
                onClick={verifyOTP} 
                disabled={loading || !name.trim() || !location.trim()} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('otp')} 
                className="w-full"
                disabled={loading}
              >
                Back to OTP
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}