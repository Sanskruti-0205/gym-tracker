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

  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

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

  const handleSaveSet = async () => {
    setMessage("");

    if (!selectedExercise) {
      setMessage("Please select an exercise.");
      return;
    }

    if (!weight || !reps) {
      setMessage("Please enter weight and reps.");
      return;
    }

    if (editingSetId) {
      const { error } = await supabase
        .from("workout_sets")
        .update({
          exercise_id: Number(selectedExercise),
          weight: Number(weight),
          reps: Number(reps),
        })
        .eq("id", editingSetId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Set updated successfully!");
      setEditingSetId(null);
    } else {
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

      setMessage("Set added successfully!");
    }

    setSelectedExercise("");
    setWeight("");
    setReps("");

    fetchSets();
  };

  const handleEditSet = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setSelectedExercise(String(set.exercise_id));
    setWeight(String(set.weight));
    setReps(String(set.reps));
    setMessage("");
  };

  const handleDeleteSet = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this set?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("workout_sets")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Set deleted successfully!");

    fetchSets();
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    setSelectedExercise("");
    setWeight("");
    setReps("");
    setMessage("");
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

      {/* Add / Edit Set */}

      <div className="mt-8 max-w-xl rounded-xl border p-6">

        <h2 className="mb-4 text-2xl font-bold">
          {editingSetId ? "Edit Set" : "Add Exercise Set"}
        </h2>

        <div className="space-y-4">

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

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <div className="flex gap-3">

            <button
              type="button"
              onClick={handleSaveSet}
              className="rounded-lg bg-black px-6 py-3 text-white"
            >
              {editingSetId ? "Update Set" : "Add Set"}
            </button>

            {editingSetId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border px-6 py-3"
              >
                Cancel
              </button>
            )}

          </div>

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

                  <div className="mt-3 flex gap-3">

                    <button
                      type="button"
                      onClick={() => handleEditSet(set)}
                      className="rounded-lg border px-4 py-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSet(set.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </main>
  );
}