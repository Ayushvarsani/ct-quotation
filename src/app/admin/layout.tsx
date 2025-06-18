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
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUsername(userData.email || 'User');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router]);

  if (!username) {
    return null; // or a loading spinner
  }

  // Don't show header on login page
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && <Header username={username} />}
      <div className="flex">
        {/* <Sidebar /> */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 