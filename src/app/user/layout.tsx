'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserHeader from '@/components/UserHeader';
import { SnackbarProvider } from '@/app/hooks/useSnackbar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUsername(userData.email || 'User');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  if (!username) {
    return null; // or a loading spinner
  }

  return (
    <SnackbarProvider>
      <div className="min-h-screen bg-gray-100">
        <UserHeader username={username} />
        <div className="flex">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SnackbarProvider>
  );
} 