'use client';

import { useReferralCode } from '@/hooks/use-referral-code';
import { useEffect } from 'react';

export function ReferralHandler() {
  useReferralCode();
  
  return null;
}