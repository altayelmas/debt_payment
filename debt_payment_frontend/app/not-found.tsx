'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function GlobalNotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');

    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl font-semibold">Could not find page</p>
            <p className="text-lg text-gray-700">Redirecting to login page...</p>
        </div>
    );
}
