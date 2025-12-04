'use client';

import {useEffect, useState} from 'react';
import {useRouter, Link} from '@/i18n/navigation';
import api from '@/lib/api';
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
import {useTranslations} from "next-intl";
import {LanguageSwitcher} from "@/components/LanguageSwitcher";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    const t = useTranslations('RegisterPage');
    const tZod = useTranslations('RegisterPage.zodErrors');
    const tErrors = useTranslations('Errors');

    const registerFormSchema = z.object({
        email: z.string()
            .min(1, {message: tZod('emailBlank')})
            .email({message: tZod('emailInvalid')}),
        password: z.string()
            .min(1, {message: tZod('passwordBlank')})
            .regex(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                {message: tZod('passwordNotStrong')}
            ),
        confirmPassword: z.string()
            .min(1, {message: tZod('confirmPasswordBlank')})
    })
        .refine(data => data.password === data.confirmPassword, {
            message: tZod('passwordsNoMatch'),
            path: ["confirmPassword"],
        });

    type RegisterFormInputs = z.infer<typeof registerFormSchema>;

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

            toast.success(t('toasts.success'));
            router.push('/login');

        } catch (error: any) {
            console.error('Register error:', error);
            let errorMessage = t('toasts.defaultError');
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square text-gray-500 dark:text-gray-400 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                    <Eye className="h-4 w-4"/>}
                                            </Button>
                                        </div>
                                        {!form.formState.errors.password && (
                                            <FormDescription className="text-xs text-muted-foreground dark:text-gray-400">
                                                {t('form.passwordDescription')}
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
                                        <FormLabel className="text-gray-900 dark:text-gray-200">{t('form.confirmPasswordLabel')}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder={t('form.passwordPlaceholder')}
                                                    className="pr-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white"
                                                    {...field}
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full aspect-square text-gray-500 dark:text-gray-400 hover:bg-transparent"
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
                                {loading ? t('form.submitButtonLoading') : t('form.submitButton')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <LanguageSwitcher/>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                            {t('footer.haveAccount')}
                            <Link href="/login" className="text-primary hover:underline ml-1 font-semibold dark:text-blue-400">
                                {t('footer.loginLink')}
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}