'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: 'Error',
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
          title: 'Success',
          description: 'OTP sent successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, name, location }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        onSuccess(data.user);
        onClose();
        resetForm();
      } else {
        if (data.error === 'Name and location are required for new users') {
          setStep('register');
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to verify OTP',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!name || !location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp, name, location }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Registration successful!',
        });
        onSuccess(data.user);
        onClose();
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to complete registration',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' && 'Login / Sign Up'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'register' && 'Complete Registration'}
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
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
              <Button onClick={sendOTP} disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send OTP'}
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
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={verifyOTP} disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button variant="outline" onClick={() => setStep('phone')} className="w-full">
                Back
              </Button>
            </>
          )}

          {step === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter your city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button onClick={completeRegistration} disabled={loading} className="w-full">
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
              <Button variant="outline" onClick={() => setStep('otp')} className="w-full">
                Back
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}