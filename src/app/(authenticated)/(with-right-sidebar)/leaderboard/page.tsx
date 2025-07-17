"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { Award, Medal, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all");
  const router = useRouter();

  const { data: leaderboard, isLoading } = api.points.getLeaderboard.useQuery({
    limit: 50,
    timeframe,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="font-bold text-lg text-muted-foreground">#{rank}</span>;
    }
  };

  const getTimeframeTitle = (timeframe: string) => {
    switch (timeframe) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return "All Time";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "all" | "week" | "month")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {getTimeframeTitle(timeframe)} - Top Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((user) => (
                  <div
                    key={user.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${user.rank <= 3 ? "bg-gradient-to-r from-blue-800/50 to-blue-900/50 border-blue-500/20" : ""
                      }`}
                    onClick={() => router.push(`/${user.username}`)}
                  >
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(user.rank)}
                    </div>

                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.image || ""} alt={user.username} />
                      <AvatarFallback>
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.username}</h3>
                        {user.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.activityCount} activities
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {user.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>

              {!leaderboard?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leaderboard data found yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}