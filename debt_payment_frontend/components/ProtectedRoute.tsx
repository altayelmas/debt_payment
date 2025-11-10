'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isClient, router]);

    if (isClient && isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className={"flex items-center justify-center min-h-screen bg-gray-100"}>
            <p className={"text-lg"}>
                Loading...
            </p>
        </div>
    );
}