'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Talent Acquisition', href: '/talent-adquision' },
    { name: 'Candidates', href: '/candidates' },
    { name: 'Technical Leads', href: '/technical-lead' },
    { name: 'Users', href: '/users' },
];

export default function Header() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-white text-white p-4 shadow-lg text-black">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image src="/cbtw.png" alt="Logo" width={100} height={100} />
                </Link>
                <div className="flex items-center space-x-4">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
};
