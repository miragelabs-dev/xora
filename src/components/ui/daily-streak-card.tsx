"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { DailyStreakModal } from "./daily-streak-modal";

export function DailyStreakCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: streakData } = api.streak.getStreak.useQuery();
  const { data: pointsStats } = api.points.getPointsStats.useQuery();

  const getStreakEmoji = () => {
    if (!streakData) return "🔥";

    const { currentStreak } = streakData;

    if (currentStreak === 0) return "🚀";
    if (currentStreak <= 3) return "🌟";
    if (currentStreak <= 7) return "🔥";
    if (currentStreak <= 30) return "⚡";
    return "👑";
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Daily Streak
            </span>
            <span className="text-2xl">{getStreakEmoji()}</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Keep your daily activity going
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {streakData?.currentStreak || 0}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {streakData?.longestStreak || 0}
              </div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {pointsStats?.totalPoints || 0}
              </div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DailyStreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}