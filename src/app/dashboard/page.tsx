"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Total workouts
    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("id, workout_date")
      .eq("user_id", user.id);

    if (workoutError) {
      console.error(workoutError);
      setLoading(false);
      return;
    }

    setTotalWorkouts(workouts?.length || 0);

    // Workouts this week
    const today = new Date();

    const day = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const startDate = startOfWeek.toISOString().split("T")[0];

    const thisWeekWorkouts =
      workouts?.filter(
        (workout) => workout.workout_date >= startDate
      ) || [];

    setWorkoutsThisWeek(thisWeekWorkouts.length);

    // Get user's workout IDs
    const workoutIds = workouts?.map((workout) => workout.id) || [];

    if (workoutIds.length === 0) {
      setTotalExercises(0);
      setTotalVolume(0);
      setLoading(false);
      return;
    }

    // Get workout sets
    const { data: sets, error: setsError } = await supabase
      .from("workout_sets")
      .select("exercise_id, weight, reps")
      .in("workout_id", workoutIds);

    if (setsError) {
      console.error(setsError);
      setLoading(false);
      return;
    }

    // Total exercises performed
    setTotalExercises(sets?.length || 0);

    // Total volume
    const volume =
      sets?.reduce(
        (total, set) =>
          total + Number(set.weight) * Number(set.reps),
        0
      ) || 0;

    setTotalVolume(volume);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold">
        Gym Tracker Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Track your workout progress.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Workouts */}
        <div className="rounded-xl border p-6">
          <p className="text-gray-600">
            Total Workouts
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalWorkouts}
          </h2>
        </div>

        {/* Exercises Performed */}
        <div className="rounded-xl border p-6">
          <p className="text-gray-600">
            Exercises Performed
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalExercises}
          </h2>
        </div>

        {/* Total Volume */}
        <div className="rounded-xl border p-6">
          <p className="text-gray-600">
            Total Volume
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalVolume} kg
          </h2>
        </div>

        {/* This Week */}
        <div className="rounded-xl border p-6">
          <p className="text-gray-600">
            Workouts This Week
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {workoutsThisWeek}
          </h2>
        </div>

      </div>

    </main>
  );
}