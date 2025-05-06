'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";

function LeaderboardSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-[80px]" />
                </div>
            ))}
        </div>
    );
}

export default function LeaderboardPage() {
    const { data: topUsers = [], isLoading } = api.leaderboard.getTopUsers.useQuery();

    return (
        <div className="container mx-auto py-6 px-6">
            <Card>
                <CardHeader>
                    <CardTitle>Interop Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <LeaderboardSkeleton />
                    ) : (
                        <div className="space-y-4">
                            {topUsers?.map((user, index) => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-4 p-4 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <span className="text-lg font-semibold w-8">#{index + 1}</span>
                                        <Avatar>
                                            <AvatarImage src={user.image ?? undefined} />
                                            <AvatarFallback>
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{user.username}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{user.interopScore} interop score</div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.transactionsCount} transactions
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}