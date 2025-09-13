import axios from 'axios';

export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const response = await axios.get(process.env.SMS_BASE_URL!, {
      params: {
        API: process.env.SMS_API_KEY,
        PHONE: phone,
        OTP: otp,
      },
    });

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}