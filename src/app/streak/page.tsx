"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StreakPage() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateStreak = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("workout_date")
      .eq("user_id", user.id)
      .order("workout_date", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!workouts || workouts.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setLoading(false);
      return;
    }

    // Remove duplicate workout dates
    const uniqueDates = [
      ...new Set(
        workouts.map((workout) => workout.workout_date)
      ),
    ];

    // Convert dates to Date objects
    const dates = uniqueDates.map(
      (date) => new Date(`${date}T00:00:00`)
    );

    let longest = 1;
    let current = 1;

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const previousDate = dates[i - 1];
      const currentDate = dates[i];

      const difference =
        (currentDate.getTime() - previousDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        current++;
      } else {
        current = 1;
      }

      longest = Math.max(longest, current);
    }

    setLongestStreak(longest);

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestDate = dates[dates.length - 1];

    const daysSinceLatest =
      (today.getTime() - latestDate.getTime()) /
      (1000 * 60 * 60 * 24);

    // Current streak is active if workout was today or yesterday
    if (daysSinceLatest > 1) {
      setCurrentStreak(0);
      setLoading(false);
      return;
    }

    let currentCount = 1;

    for (let i = dates.length - 1; i > 0; i--) {
      const currentDate = dates[i];
      const previousDate = dates[i - 1];

      const difference =
        (currentDate.getTime() - previousDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        currentCount++;
      } else {
        break;
      }
    }

    setCurrentStreak(currentCount);
    setLoading(false);
  };

  useEffect(() => {
    calculateStreak();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <p>Calculating streak...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold">
        Workout Streak
      </h1>

      <p className="mt-2 text-gray-600">
        Keep your workout consistency going!
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">

        {/* Current Streak */}

        <div className="rounded-xl border p-8">

          <p className="text-gray-600">
            Current Streak
          </p>

          <h2 className="mt-2 text-5xl font-bold">
            {currentStreak}
          </h2>

          <p className="mt-2 text-gray-600">
            {currentStreak === 1 ? "day" : "days"}
          </p>

        </div>

        {/* Longest Streak */}

        <div className="rounded-xl border p-8">

          <p className="text-gray-600">
            Longest Streak
          </p>

          <h2 className="mt-2 text-5xl font-bold">
            {longestStreak}
          </h2>

          <p className="mt-2 text-gray-600">
            {longestStreak === 1 ? "day" : "days"}
          </p>

        </div>

      </div>

    </main>
  );
}