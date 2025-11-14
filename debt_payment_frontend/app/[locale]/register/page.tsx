'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useForm} from 'react-hook-form';
import {Eye, EyeOff, Loader2} from 'lucide-react';
import {useAuth} from "@/context/AuthContext";

import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

export const dynamic = 'force-dynamic';

const registerFormSchema = z.object({
    email: z.string()
        .min(1, {message: "Email field cannot be blank"})
        .email({message: "Invalid email address."}),
    password: z.string()
        .min(1, {message: "Password cannot be blank"})
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
            {message: "Password is not strong enough."}
        ),
    confirmPassword: z.string()
        .min(1, {message: "Please confirm your password"})
})
    .refine(data => data.password === data.confirmPassword, {
        message: "Password does not match",
        path: ["confirmPassword"],
    });

type RegisterFormInputs = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const {isAuthenticated} = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

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
            const data = error.response?.data;

            if (data && Array.isArray(data)) {
                if (data.length > 0 && typeof data[0] === 'string') {
                    errorMessage = data.join(' ');
                }
                else if (data.length > 0 && typeof data[0] === 'object' && data[0].description) {
                    errorMessage = data.map((err: any) => err.description).join(' ');
                }
            }
            else if (data?.Errors && Array.isArray(data.Errors)) {
                errorMessage = data.Errors.join(' ');
            }
            else if (typeof data === 'string') {
                errorMessage = data;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="mr-2 h-6 w-6 animate-spin"/>
                <p className="text-lg text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Register</CardTitle>
                    <CardDescription>Create your account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                    <Eye className="h-4 w-4"/>}
                                            </Button>
                                        </div>
                                        {!form.formState.errors.password && (
                                            <FormDescription className="text-xs">
                                                Min. 8 Chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Symbol.
                                            </FormDescription>
                                        )}
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                                    <Eye className="h-4 w-4"/>}
                                            </Button>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        Already have an account?
                        <Link href="/login" className="text-primary hover:underline ml-1 font-semibold">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
