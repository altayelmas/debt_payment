'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import { Loader2 } from 'lucide-react';

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
      <div className={"flex items-center justify-center min-h-screen bg-background p-4"}>
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
          <p className={"text-lg text-muted-foreground"}>
            Redirecting...
          </p>
        </div>

      </div>
  );
}
