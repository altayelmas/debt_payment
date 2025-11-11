'use client';

import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"

export default function Navbar() {
    const { logout, userEmail} = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className={"bg-background border-b w-full mb-8"}>
            <div className={"container mx-auto flex justify-between items-center p-4"}>
                <Link href="/dashboard" className="text-xl font-bold text-primary hover:opacity-80 transition-colors">
                    Debt Calculator
                </Link>
                <div className={"flex items-center gap-4"}>
                    <span className={"text-sm text-muted-foreground hidden sm:block"}>
                        {userEmail}
                    </span>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        size="sm"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
}