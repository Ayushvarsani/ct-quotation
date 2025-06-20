'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setUsername(null); // Explicitly set to null
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUsername(userData.email || 'User');
    } catch (error) {
      console.error('Error parsing user data:', error);
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setUsername(null); // Explicitly set to null
    }
  }, [router, pathname]);

  const isLoginPage = pathname === '/admin/login';

  // For non-login pages, if we don't have a username yet (e.g., on server),
  // we should render nothing to prevent content flashing and hydration errors.
  // The useEffect will handle redirecting on the client.
  if (!isLoginPage && username === null) {
    return null; // or a loading skeleton
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && username && <Header username={username} />}
      <div className="flex">
        {/* <Sidebar /> */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 