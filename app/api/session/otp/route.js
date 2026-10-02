import { NextResponse } from 'next/server'
import { completeLogin } from '../_login'

// POST { phoneNumber: '+91XXXXXXXXXX', otp, referredBy? } — verifies the code sent by /api/auth/phone/send-otp
export async function POST(req) {
  const { phoneNumber, otp, referredBy } = await req.json().catch(() => ({}))
  if (!/^\+91[6-9]\d{9}$/.test(phoneNumber || '') || !/^\d{6}$/.test(otp || '')) {
    return NextResponse.json({ success: false, message: 'Enter the 6-digit code sent to your phone.' }, { status: 400 })
  }
  return completeLogin(req, '/auth/phone/verify-otp', { phoneNumber, otp, referred_by: referredBy || null })
}
