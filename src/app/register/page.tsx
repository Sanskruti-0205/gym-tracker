"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Registration successful! Check your email.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-8">

        <h1 className="mb-6 text-3xl font-bold">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black p-3 text-white"
          >
            Register
          </button>

        </form>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}