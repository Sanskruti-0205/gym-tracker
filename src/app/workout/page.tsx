"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Workout = {
  id: number;
  name: string;
  workout_date: string;
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [name, setName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [message, setMessage] = useState("");

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("workout_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setWorkouts(data || []);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { error } = await supabase.from("workouts").insert({
      user_id: user.id,
      name,
      workout_date: workoutDate,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setWorkoutDate("");
    setMessage("Workout created successfully!");

    fetchWorkouts();
  };

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold">
        Workouts
      </h1>

      <p className="mt-2 text-gray-600">
        Create and manage your workout sessions.
      </p>

      {/* Create Workout */}
      <div className="mt-8 max-w-xl rounded-xl border p-6">

        <h2 className="mb-4 text-2xl font-bold">
          Create Workout
        </h2>

        <form
          onSubmit={handleCreateWorkout}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Workout Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-3 text-white"
          >
            Create Workout
          </button>

        </form>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}

      </div>

      {/* My Workouts */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold">
          My Workouts
        </h2>

        {workouts.length === 0 ? (
          <p className="mt-4 text-gray-600">
            No workouts created yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">

            {workouts.map((workout) => (
              <a
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="block rounded-xl border p-5 hover:bg-gray-50"
              >

                <h3 className="text-xl font-bold">
                  {workout.name}
                </h3>

                <p className="text-gray-600">
                  Date: {workout.workout_date}
                </p>

                <p className="mt-2 text-sm text-blue-600">
                  Click to add exercises →
                </p>

              </a>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}