'use client';

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff} from 'lucide-react';
import {useAuth} from "@/context/AuthContext";

export const dynamic = 'force-dynamic';

type RegisterFormInputs = {
    email: string;
    password: string;
    confirmPassword: string;
};

export default function RegisterPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { isAuthenticated } = useAuth();


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const password = watch('password');

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data: RegisterFormInputs) => {
        setLoading(true);
        try {
            await api.post('/api/auth/register', {
                email: data.email,
                password: data.password,
            });

            toast.success('Register successful! Please log in.');
            router.push('/login');

        } catch (error: any) {
            console.error('Register error:', error);
            let errorMessage = 'Register failed..';
            if (error.response?.data && Array.isArray(error.response.data)) {
                errorMessage = error.response.data.map((err: any) => err.description).join(' ');
            } else if (error.response?.data?.Errors) {
                errorMessage = error.response.data.Errors.join(' ');
            }
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Register</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            {...register('email', { required: 'Email field cannot be blank' })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                        <div className={"relative"}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                {...register('password', {
                                    required: 'Password cannot be blank',
                                    pattern: {
                                        value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                                        message: 'Password is not strong enough. (Min. 8 Characters, 1 Uppercase, 1 Lowercase, 1 Number, 1 Non-alphanumeric)'
                                    }
                                })}
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
                        <div className={"relative"}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Password does not match'
                                })}
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowConfirmPassword(true)}
                                onMouseUp={() => setShowConfirmPassword(false)}
                                onMouseLeave={() => setShowConfirmPassword(false)}
                                className = "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.confirmPassword &&
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-700">
                    Already have an account?
                    <Link href="/login" className="text-blue-600 hover:underline ml-1">Login</Link>
                </p>
            </div>
        </div>
    );
}
