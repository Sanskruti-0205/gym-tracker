"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(!!user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!user || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/dashboard"
          className="text-xl font-bold"
        >
          Gym Tracker
        </Link>

        <div className="flex items-center gap-5 text-sm">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/exercises">
            Exercises
          </Link>

          <Link href="/workout">
            Workouts
          </Link>

          <Link href="/progress">
            Progress
          </Link>

          <Link href="/streak">
            Streak
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}