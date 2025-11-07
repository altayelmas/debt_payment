'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const { logout, userEmail} = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className={"bg-white shadow-md w-full mb-8"}>
            <div className={"container mx-auto flex justify-between items-center p-4"}>
                <Link href="/dashboard">
                    <h1 className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                        Debt Calculator
                    </h1>
                </Link>
                <div className={"flex items-center"}>
                    <span className={"text-gray-700 mr-4 hidden sm:block"}>{userEmail}</span>
                    <button
                        onClick={handleLogout}
                        className={"bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}