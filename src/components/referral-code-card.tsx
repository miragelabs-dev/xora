'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { Copy, Gift, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ReferralCodeCard() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralUrl, setReferralUrl] = useState<string>("");

  const { data: existingCode, refetch } = api.referral.getReferralCode.useQuery();
  const { data: stats } = api.referral.getReferralStats.useQuery();

  const generateCode = api.referral.generateReferralCode.useMutation({
    onSuccess: (data) => {
      setReferralCode(data.referralCode);
      refetch();
      toast.success("Referral code generated!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  useEffect(() => {
    if (existingCode) {
      setReferralCode(existingCode);
    }
  }, [existingCode]);

  useEffect(() => {
    if (referralCode) {
      setReferralUrl(`${window.location.origin}/?referralCode=${referralCode}`);
    }
  }, [referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral URL copied to clipboard!");
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Code
        </CardTitle>
        <CardDescription>
          Share your referral code with friends to earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {stats && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{stats.totalReferrals} people joined using your code</span>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => generateCode.mutate()}
            disabled={generateCode.isPending}
            className="w-full"
          >
            {generateCode.isPending ? "Generating..." : "Generate Referral Code"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}