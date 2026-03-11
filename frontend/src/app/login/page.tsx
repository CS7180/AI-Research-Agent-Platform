'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';
import LoginCard from '@/components/auth/LoginCard';

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // If already logged in, redirect to home
    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-primary" />
            </div>
        );
    }

    if (user) return null;

    return <LoginCard />;
}
