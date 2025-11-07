'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login")
    }
  }, [isAuthenticated, router]);

  return (
      <div className={"flex items-center justify-center min-h-screen bg-gray-100"}>
        <p className={"text-lg"}>Redirecting...</p>
      </div>
  );
}
