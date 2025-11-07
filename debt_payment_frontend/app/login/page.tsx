'use client';

import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff} from 'lucide-react';

export const dynamic = 'force-dynamic';

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const { register, handleSubmit, formState: {errors} } = useForm<LoginFormInputs>();
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data: LoginFormInputs) => {
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', {
                email: data.email,
                password: data.password
            });

            login(response.data.token);

            toast.success('Login successful, redirecting...');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error: ', error);
            const errorMessage = error.response?.data?.errors?.[0] ||
                error.response?.data?.Error ||
                error.response?.data ||
                'Login failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className={"flex items-center justify-center min-h-screen bg-gray-100"}>
            <div className={"p-8 bg-white rounded-lg shadow-md w-full max-w-md"}>
                <h2 className={"text-2xl font-bold text-center mb-6 text-gray-900"}>
                    Login
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={"mb-4"}>
                        <label className={"block text-gray-700 mb-2"} htmlFor={"email"}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className={"w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"}
                            {...register('email', { required: 'This field cannot be blank' })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div className={"mb-6"}>
                        <label className={"block text-gray-700 mb-2"} htmlFor={"password"}>Password</label>
                        <div className={"relative"}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className={"w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"}
                                {...register('password', {required: 'This field cannot be blank'})}
                            />
                            <button
                                type={"button"}
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={()=> setShowPassword(false)}
                                onMouseLeave={()=> setShowPassword(false)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={"w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className={"text-center mt-4 text-sm text-gray-700"}>
                    Don&#39;t have an account?
                    <Link href={"/register"} className={"text-blue-600 hover:underline ml-1"}>Register</Link>
                </p>
            </div>
        </div>
    );
}