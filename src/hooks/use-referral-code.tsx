'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferralCode() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get('referralCode');
    
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
  }, [searchParams]);

  const getReferralCode = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('referralCode');
    }
    return null;
  };

  const clearReferralCode = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('referralCode');
    }
  };

  return {
    getReferralCode,
    clearReferralCode,
  };
}