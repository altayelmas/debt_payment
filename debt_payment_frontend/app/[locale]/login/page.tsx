'use client';

import {useTranslations, useLocale} from 'next-intl';
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {useRouter, Link} from "@/i18n/navigation";
import api from '@/lib/api';
import toast from "react-hot-toast";
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
import {LanguageSwitcher} from "@/components/LanguageSwitcher";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const t = useTranslations('LoginPage');
    const tZod = useTranslations('LoginPage.zodErrors');
    const tErrors = useTranslations('Errors');
    const locale = useLocale();

    const loginFormSchema = z.object({
        email: z.string()
            .min(1, {message: tZod('required')})
            .email({message: tZod('emailInvalid')}),
        password: z.string()
            .min(1, {message: tZod('required')}),
    });

    type LoginFormInputs = z.infer<typeof loginFormSchema>;

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

            toast.success(t('toasts.success'));
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error: ', error);
            const code = error.response?.data?.errors?.[0]

            if (code) {
                if (code === 'COULD_NOT_FIND_EMAIL') {
                    toast.error(
                        tErrors('COULD_NOT_FIND_EMAIL')
                    );
                }
            } else if (code === 'INVALID_PASSWORD') {
                toast.error(
                    tErrors('INVALID_PASSWORD')
                );
            } else {
                toast.error(
                    tErrors("GENERIC_ERROR")
                );
            }


            const errorMessage = error.response?.data?.errors?.[0] ||
                error.response?.data?.Error ||
                error.response?.data ||
                'Login failed';
            //toast.error(errorMessage || t('toasts.defaultError'));
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary"/>
                <p className="text-lg text-muted-foreground">{t('redirecting')}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('title')}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">{t('subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 dark:text-gray-200">{t('form.emailLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('form.emailPlaceholder')}
                                                className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white"
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
                                        <FormLabel className="text-gray-900 dark:text-gray-200">{t('form.passwordLabel')}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={t('form.passwordPlaceholder')}
                                                    className="pr-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white"
                                                    {...field}
                                                    autoComplete="current-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square hover:bg-transparent text-gray-500 dark:text-gray-400"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" aria-hidden="true"/>
                                                ) : (
                                                    <Eye className="h-4 w-4" aria-hidden="true"/>
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? t('form.hidePassword') : t('form.showPassword')}
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
                                {loading ? t('form.submitButtonLoading') : t('form.submitButton')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <LanguageSwitcher/>

                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                            {t('footer.noAccount')}
                            <Link href="/register" className="text-primary hover:underline ml-1 font-semibold dark:text-blue-400">
                                {t('footer.registerLink')}
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}