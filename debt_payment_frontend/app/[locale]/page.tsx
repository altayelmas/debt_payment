'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter} from "@/i18n/navigation";
import {useEffect} from "react";
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('HomePage');

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
            {t('redirecting')}
          </p>
        </div>

      </div>
  );
}
