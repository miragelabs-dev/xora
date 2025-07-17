'use client';

import { useReferralCode } from '@/hooks/use-referral-code';
import { api } from '@/utils/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ReferralProcessor() {
  const { getReferralCode, clearReferralCode } = useReferralCode();
  const [processed, setProcessed] = useState(false);

  const validateWithReferral = api.auth.validateWithReferral.useMutation({
    onSuccess: () => {
      clearReferralCode();
      setProcessed(true);
      toast.success('Welcome! You were successfully referred by a friend.');
    },
    onError: (error) => {
      console.error('Referral processing failed:', error);
      clearReferralCode();
      setProcessed(true);
    }
  });

  useEffect(() => {
    if (processed) return;

    const referralCode = getReferralCode();
    if (referralCode) {
      setTimeout(() => {
        validateWithReferral.mutate({ referralCode });
      }, 1000);
    } else {
      setProcessed(true);
    }
  }, [processed, getReferralCode, validateWithReferral]);

  return null;
}