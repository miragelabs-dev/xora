'use client';

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useCrypto } from "@/contexts/crypto-context";
import { api } from "@/utils/api";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

function CryptoAccountSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-md ml-4" />
    </div>
  );
}

export function TopCryptoAccounts() {
  const { data: cryptoAccounts, isLoading: isAccountsLoading } = api.user.getTopCryptoAccounts.useQuery();
  const { prices, isLoading: isPricesLoading } = useCrypto();
  const utils = api.useUtils();

  const { mutate: follow, isPending: isFollowPending } = api.user.follow.useMutation({
    onSuccess: () => {
      utils.user.getTopCryptoAccounts.invalidate();
    },
  });

  const { mutate: unfollow, isPending: isUnfollowPending } = api.user.unfollow.useMutation({
    onSuccess: () => {
      utils.user.getTopCryptoAccounts.invalidate();
    },
  });

  const isLoading = isAccountsLoading || isPricesLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl bg-muted/50 p-4">
        <h2 className="mb-4 text-xl font-bold">
          Crypto Accounts
        </h2>
        <div className="space-y-4">
          <CryptoAccountSkeleton />
          <CryptoAccountSkeleton />
          <CryptoAccountSkeleton />
          <CryptoAccountSkeleton />
          <CryptoAccountSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <h2 className="mb-4 text-xl font-bold">
        Crypto Accounts
      </h2>
      <div className="space-y-4">
        {cryptoAccounts?.map((account) => {
          const price = prices[account.address];

          return (
            <div key={account.id} className="flex items-center justify-between">
              <Link
                href={`/${account.username}`}
                className="flex flex-1 items-center gap-2 min-w-0 group"
              >
                <UserAvatar
                  src={account.image}
                  className="h-10 w-10"
                  fallback={account.username[0]}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold truncate group-hover:text-primary">
                      {account.username}
                    </p>
                  </div>
                  {price && (
                    <div className="flex gap-2">
                      <p className="font-medium text-sm text-muted-foreground">${price.current_price.toLocaleString()}</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${price.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {price.price_change_percentage_24h >= 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(price.price_change_percentage_24h).toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </Link>
              <Button
                variant={account.isFollowing ? "outline" : "default"}
                className="ml-4"
                onClick={() => {
                  if (account.isFollowing) {
                    unfollow({ userId: account.id });
                  } else {
                    follow({ userId: account.id });
                  }
                }}
                disabled={isFollowPending || isUnfollowPending}
              >
                {account.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
} 