"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Workout = {
  id: number;
  name: string;
  workout_date: string;
};

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
};

type WorkoutSet = {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
};

export default function WorkoutDetailsPage() {
  const params = useParams();
  const workoutId = params.id;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);

  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const [message, setMessage] = useState("");

  // Fetch workout
  const fetchWorkout = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setWorkout(data);
  };

  // Fetch exercises
  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setExercises(data || []);
  };

  // Fetch sets for this workout
  const fetchSets = async () => {
    const { data, error } = await supabase
      .from("workout_sets")
      .select("*")
      .eq("workout_id", Number(workoutId))
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setSets(data || []);
  };

  // Add a set
  const handleAddSet = async () => {
    setMessage("");

    if (!selectedExercise) {
      setMessage("Please select an exercise.");
      return;
    }

    if (!weight || !reps) {
      setMessage("Please enter weight and reps.");
      return;
    }

    const { error } = await supabase
      .from("workout_sets")
      .insert({
        workout_id: Number(workoutId),
        exercise_id: Number(selectedExercise),
        weight: Number(weight),
        reps: Number(reps),
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setWeight("");
    setReps("");
    setMessage("Set added successfully!");

    // Refresh the set list
    fetchSets();
  };

  useEffect(() => {
    fetchWorkout();
    fetchExercises();
    fetchSets();
  }, [workoutId]);

  if (!workout) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading workout...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">

      {/* Workout Header */}
      <h1 className="text-4xl font-bold">
        {workout.name}
      </h1>

      <p className="mt-2 text-gray-600">
        Date: {workout.workout_date}
      </p>

      {/* Add Set */}
      <div className="mt-8 max-w-xl rounded-xl border p-6">

        <h2 className="mb-4 text-2xl font-bold">
          Add Exercise Set
        </h2>

        <div className="space-y-4">

          {/* Exercise */}
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
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

          {/* Weight */}
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          {/* Reps */}
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAddSet}
            className="rounded-lg bg-black px-6 py-3 text-white"
          >
            Add Set
          </button>

        </div>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}

      </div>

      {/* Workout Sets */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold">
          Workout Sets
        </h2>

        {sets.length === 0 ? (
          <p className="mt-4 text-gray-600">
            No sets added yet.
          </p>
        ) : (
          <div className="mt-4 max-w-xl space-y-3">

            {sets.map((set) => {

              const exercise = exercises.find(
                (exercise) => exercise.id === set.exercise_id
              );

              return (
                <div
                  key={set.id}
                  className="rounded-xl border p-4"
                >

                  <h3 className="font-bold">
                    {exercise?.name || "Exercise"}
                  </h3>

                  <p className="text-gray-600">
                    {set.weight} kg × {set.reps} reps
                  </p>

                  <p className="text-sm text-gray-500">
                    Volume: {set.weight * set.reps} kg
                  </p>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </main>
  );
}