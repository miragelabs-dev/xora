"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { Clock, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyStreakModal({ isOpen, onClose }: DailyStreakModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: streakData, refetch: refetchStreak } = api.streak.getStreak.useQuery();
  const { data: streakStats } = api.streak.getStreakStats.useQuery();
  const { data: badgeProgress } = api.badge.getBadgeProgress.useQuery();
  const { data: pointsStats } = api.points.getPointsStats.useQuery();

  const updateStreakMutation = api.streak.updateStreak.useMutation({
    onSuccess: () => {
      toast.success("Daily streak updated! 🔥");
      refetchStreak();
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUpdating(false);
    },
  });

  const handleUpdateStreak = () => {
    if (!streakData?.canExtendToday) {
      toast.info("You've already updated your streak today!");
      return;
    }

    setIsUpdating(true);
    updateStreakMutation.mutate();
  };

  const getStreakMessage = () => {
    if (!streakData) return "Loading...";

    const { currentStreak } = streakData;

    if (currentStreak === 0) {
      return "Start your streak today! 🚀";
    } else if (currentStreak === 1) {
      return "Great start! You're on day 1 🌟";
    } else {
      return `Amazing! You're on day ${currentStreak} 🔥`;
    }
  };

  const getStreakEmoji = () => {
    if (!streakData) return "🔥";

    const { currentStreak } = streakData;

    if (currentStreak === 0) return "🚀";
    if (currentStreak <= 3) return "🌟";
    if (currentStreak <= 7) return "🔥";
    if (currentStreak <= 30) return "⚡";
    return "👑";
  };

  const nearestBadge = badgeProgress?.find(badge => !badge.isEarned && badge.requirementType === "streak");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Daily Streak
          </DialogTitle>
          <DialogDescription>
            Keep your daily activity streak alive and earn points!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl">{getStreakEmoji()}</CardTitle>
              <CardDescription className="text-lg font-medium">
                {getStreakMessage()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {streakData?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {streakData?.longestStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Best</div>
                </div>
              </div>

              <Button
                onClick={handleUpdateStreak}
                disabled={!streakData?.canExtendToday || isUpdating}
                className="w-full"
                size="lg"
              >
                {isUpdating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : streakData?.canExtendToday ? (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Continue Streak (+10 points)
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Streak Updated for Today!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="stats" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="points">Points</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {streakStats?.totalStreaks || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Streaks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {streakStats?.totalPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Streak Points</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {streakData?.longestStreak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Longest</div>
                  </CardContent>
                </Card>
              </div>

              {nearestBadge && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Next Badge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{nearestBadge.icon}</span>
                      <div>
                        <div className="font-semibold">{nearestBadge.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {nearestBadge.description}
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={nearestBadge.progressPercentage}
                      className="mb-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      {nearestBadge.currentProgress} / {nearestBadge.requirementValue} days
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="badges" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {badgeProgress?.filter(badge => badge.requirementType === "streak").map((badge) => (
                  <Card key={badge.id} className={badge.isEarned ? "border-green-500" : ""}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {badge.name}
                          {badge.isEarned && (
                            <Badge variant="secondary" className="text-green-600">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {badge.description}
                        </div>
                        {!badge.isEarned && (
                          <>
                            <Progress value={badge.progressPercentage} className="mb-1" />
                            <div className="text-xs text-muted-foreground">
                              {badge.currentProgress} / {badge.requirementValue} days
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {pointsStats?.totalPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {pointsStats?.todayPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {pointsStats?.weekPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      #{pointsStats?.globalRank || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Global Rank</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}