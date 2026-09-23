"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setExercises(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { error } = await supabase.from("exercises").insert({
      user_id: user.id,
      name,
      muscle_group: muscleGroup,
      equipment,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setMuscleGroup("");
    setEquipment("");
    setMessage("Exercise added successfully!");

    fetchExercises();
  };

  const handleUpdateExercise = async (id: number) => {
  const { error } = await supabase
    .from("exercises")
    .update({
      name,
      muscle_group: muscleGroup,
      equipment,
    })
    .eq("id", id);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Exercise updated successfully!");
  setEditingId(null);

  setName("");
  setMuscleGroup("");
  setEquipment("");

  fetchExercises();
};

const handleDeleteExercise = async (id: number) => {
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Exercise deleted successfully!");

  fetchExercises();
};

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-4xl font-bold">
        Exercises
      </h1>

      <p className="mt-2 text-gray-600">
        Manage your exercises.
      </p>

      {/* Add Exercise Form */}
      <div className="mt-8 max-w-xl rounded-xl border p-6">

        <h2 className="mb-4 text-2xl font-bold">
          Add Exercise
        </h2>

        <form
  onSubmit={(e) => {
    e.preventDefault();

    if (editingId) {
      handleUpdateExercise(editingId);
    } else {
      handleAddExercise(e);
    }
  }}
  className="space-y-4"
>

          <input
            type="text"
            placeholder="Exercise Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Muscle Group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-3 text-white"
          >
           {editingId ? "Update Exercise" : "Add Exercise"}
          </button>

        </form>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}

      </div>

      {/* Exercise List */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold">
          My Exercises
        </h2>

        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : exercises.length === 0 ? (
          <p className="mt-4 text-gray-600">
            No exercises added yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">

            {exercises.map((exercise) => (
  <div
    key={exercise.id}
    className="rounded-xl border p-5"
  >
    <h3 className="text-xl font-bold">
      {exercise.name}
    </h3>

    <p className="text-gray-600">
      Muscle: {exercise.muscle_group}
    </p>

    <p className="text-gray-600">
      Equipment: {exercise.equipment}
    </p>

    <div className="mt-4 flex gap-3">

      <button
        onClick={() => {
          setEditingId(exercise.id);
          setName(exercise.name);
          setMuscleGroup(exercise.muscle_group);
          setEquipment(exercise.equipment);
        }}
        className="rounded-lg border px-4 py-2"
      >
        Edit
      </button>

      <button
        onClick={() => handleDeleteExercise(exercise.id)}
        className="rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        Delete
      </button>

    </div>
  </div>
))}

          </div>
        )}

      </div>

    </main>
  );
}