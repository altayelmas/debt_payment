'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';


export default function GlobalNotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');

    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                <p className="text-lg text-muted-foreground">
                    Page not found. Redirecting to login...
                </p>
            </div>
        </div>
    );
}
