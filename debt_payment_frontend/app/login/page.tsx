'use client';

import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {Eye, EyeOff, Loader2} from 'lucide-react';

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

export const dynamic = 'force-dynamic';

const loginFormSchema = z.object({
    email: z.string()
        .min(1, {message: "This field cannot be blank"})
        .email({message: "Invalid email address."}),
    password: z.string()
        .min(1, {message: "This field cannot be blank"}),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {login, isAuthenticated} = useAuth();
    const router = useRouter();

    const form = useForm<LoginFormInputs>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

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
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="mr-2 h-6 w-6 animate-spin"/>
                <p className="text-lg text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className={"flex items-center justify-center min-h-screen bg-background p-4"}>
            <Card className={"w-full max-w-md"}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                                                    autoComplete="current-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" aria-hidden="true"/>
                                                ) : (
                                                    <Eye className="h-4 w-4" aria-hidden="true"/>
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? "Hide password" : "Show password"}
                                                </span>
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
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        Don&#39;t have an account?
                        <Link href={"/register"} className="text-primary hover:underline ml-1 font-semibold">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}