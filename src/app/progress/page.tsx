"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Exercise = {
  id: number;
  name: string;
};

type WorkoutSet = {
  id: number;
  workout_id: number;
  exercise_id: number;
  weight: number;
  reps: number;
};

type Workout = {
  id: number;
  workout_date: string;
};

export default function ProgressPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  const [previousSet, setPreviousSet] = useState<WorkoutSet | null>(null);
  const [currentSet, setCurrentSet] = useState<WorkoutSet | null>(null);

  const [bestWeight, setBestWeight] = useState(0);
  const [bestReps, setBestReps] = useState(0);

  const [loading, setLoading] = useState(false);

  // Fetch exercises
  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("id, name")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setExercises(data || []);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Fetch progress
  const fetchProgress = async (exerciseId: string) => {
    if (!exerciseId) {
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Get user's workouts
    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("id, workout_date")
      .eq("user_id", user.id)
      .order("workout_date", { ascending: false });

    if (workoutError) {
      console.error(workoutError);
      setLoading(false);
      return;
    }

    if (!workouts || workouts.length === 0) {
      setLoading(false);
      return;
    }

    const workoutIds = workouts.map((workout) => workout.id);

    // Get sets for selected exercise
    const { data: sets, error: setsError } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("exercise_id", Number(exerciseId))
      .in("workout_id", workoutIds);

    if (setsError) {
      console.error(setsError);
      setLoading(false);
      return;
    }

    if (!sets || sets.length === 0) {
      setPreviousSet(null);
      setCurrentSet(null);
      setBestWeight(0);
      setBestReps(0);
      setLoading(false);
      return;
    }

    // Match each set with its workout date
    const setsWithDate = sets.map((set) => {
      const workout = workouts.find(
        (workout) => workout.id === set.workout_id
      );

      return {
        ...set,
        workout_date: workout?.workout_date || "",
      };
    });

    // Sort newest first
    setsWithDate.sort((a, b) =>
      b.workout_date.localeCompare(a.workout_date)
    );

    // Group sets by workout date
    const dates = [
      ...new Set(
        setsWithDate.map((set) => set.workout_date)
      ),
    ];

    const currentDate = dates[0];
    const previousDate = dates[1];

    const currentSets = setsWithDate.filter(
      (set) => set.workout_date === currentDate
    );

    const previousSets = setsWithDate.filter(
      (set) => set.workout_date === previousDate
    );

    // Use the heaviest set from each session
    const currentBest =
      currentSets.length > 0
        ? currentSets.reduce((best, set) =>
            Number(set.weight) > Number(best.weight)
              ? set
              : best
          )
        : null;

    const previousBest =
      previousSets.length > 0
        ? previousSets.reduce((best, set) =>
            Number(set.weight) > Number(best.weight)
              ? set
              : best
          )
        : null;

    setCurrentSet(currentBest);
    setPreviousSet(previousBest);

    // Best weight and reps
    const maxWeight = Math.max(
      ...sets.map((set) => Number(set.weight))
    );

    const maxReps = Math.max(
      ...sets.map((set) => Number(set.reps))
    );

    setBestWeight(maxWeight);
    setBestReps(maxReps);

    setLoading(false);
  };

  const handleExerciseChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const exerciseId = e.target.value;

    setSelectedExercise(exerciseId);

    fetchProgress(exerciseId);
  };

  // Estimated 1RM
  const estimatedOneRM = currentSet
    ? Number(currentSet.weight) *
      (1 + Number(currentSet.reps) / 30)
    : 0;

  // Progress status
  let progressStatus = "→ Maintained";

  if (currentSet && previousSet) {
    if (currentSet.weight > previousSet.weight) {
      progressStatus = "↑ Improved";
    } else if (currentSet.weight < previousSet.weight) {
      progressStatus = "↓ Decreased";
    }
  }

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold">
        Progress Tracking
      </h1>

      <p className="mt-2 text-gray-600">
        Track your performance for each exercise.
      </p>

      {/* Exercise Selection */}

      <div className="mt-8 max-w-xl">

        <label className="mb-2 block font-medium">
          Select Exercise
        </label>

        <select
          value={selectedExercise}
          onChange={handleExerciseChange}
          className="w-full rounded-lg border p-3"
        >
          <option value="">
            Select Exercise
          </option>

          {exercises.map((exercise) => (
            <option
              key={exercise.id}
              value={exercise.id}
            >
              {exercise.name}
            </option>
          ))}
        </select>

      </div>

      {loading && (
        <p className="mt-8">
          Loading progress...
        </p>
      )}

      {!loading && selectedExercise && !currentSet && (
        <p className="mt-8 text-gray-600">
          No workout data found for this exercise.
        </p>
      )}

      {!loading && currentSet && (
        <div className="mt-8 max-w-3xl space-y-6">

          {/* Current Session */}

          <div className="rounded-xl border p-6">

            <h2 className="text-2xl font-bold">
              Current Session
            </h2>

            <p className="mt-3">
              Weight: <strong>{currentSet.weight} kg</strong>
            </p>

            <p>
              Reps: <strong>{currentSet.reps}</strong>
            </p>

            <p>
              Estimated 1RM:{" "}
              <strong>
                {estimatedOneRM.toFixed(1)} kg
              </strong>
            </p>

          </div>

          {/* Previous Session */}

          <div className="rounded-xl border p-6">

            <h2 className="text-2xl font-bold">
              Previous Session
            </h2>

            {previousSet ? (
              <>
                <p className="mt-3">
                  Weight:{" "}
                  <strong>{previousSet.weight} kg</strong>
                </p>

                <p>
                  Reps:{" "}
                  <strong>{previousSet.reps}</strong>
                </p>
              </>
            ) : (
              <p className="mt-3 text-gray-600">
                No previous session available.
              </p>
            )}

          </div>

          {/* Best Performance */}

          <div className="rounded-xl border p-6">

            <h2 className="text-2xl font-bold">
              Best Performance
            </h2>

            <p className="mt-3">
              Best Weight:{" "}
              <strong>{bestWeight} kg</strong>
            </p>

            <p>
              Best Reps:{" "}
              <strong>{bestReps}</strong>
            </p>

          </div>

          {/* Progress */}

          <div className="rounded-xl border p-6">

            <h2 className="text-2xl font-bold">
              Progress
            </h2>

            <p className="mt-3 text-xl font-bold">
              {progressStatus}
            </p>

          </div>

        </div>
      )}

    </main>
  );
}