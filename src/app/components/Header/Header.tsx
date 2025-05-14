'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    email: string;
    userName: string;
    userType: string;
    userStatus: string;
};

const protectedNavigation = [
    { name: 'Talent Acquisition', href: '/talent-adquision' },
    { name: 'Candidates', href: '/candidates' },
    { name: 'Technical Leads', href: '/technical-lead' },
    { name: 'Users', href: '/users' },
];

export default function Header() {
    const router = useRouter();
    const [hasSession, setHasSession] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Handle clicking outside of dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const validateSession = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/auth/validate-session');
                const data = await response.json();

                if (data.isValid) {
                    setHasSession(true);
                    setUser(data.user);
                } else {
                    setHasSession(false);
                    setUser(null);
                    // Clear invalid cookie
                    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                    router.push('/');
                }
            } catch (error) {
                console.error('Session validation error:', error);
                setHasSession(false);
                setUser(null);
                document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
        // Validate session every minute
        const interval = setInterval(validateSession, 60000);

        return () => clearInterval(interval);
    }, []);

    // Check for session cookie changes
    useEffect(() => {
        const checkCookieChange = () => {
            const cookies = document.cookie.split(';');
            const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('session='));

            if (!hasSessionCookie && hasSession) {
                setHasSession(false);
                setUser(null);
                router.push('/');
            } else if (hasSessionCookie && !hasSession) {
                validateSession();
            }
        };

        const validateSession = async () => {
            try {
                const response = await fetch('/api/auth/validate-session');
                const data = await response.json();

                if (data.isValid) {
                    setHasSession(true);
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Session validation error:', error);
            }
        };

        // Check for cookie changes every second
        const interval = setInterval(checkCookieChange, 1000);
        return () => clearInterval(interval);
    }, []);

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
        <header className="bg-white text-white p-4 shadow-lg text-black fixed top-0 left-0 right-0">
            <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/cbtw.png"
                        alt="Logo"
                        width={100}
                        height={40}
                        priority
                    />
                </Link>
                <div className="flex items-center space-x-4">
                    {isLoading ? (
                        <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>
                    ) : !hasSession ? (
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Login
                        </Link>
                    ) : (
                        <>
                            {protectedNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {user && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-3 focus:outline-none cursor-pointer"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-300 text-black font-bold text-md hover:bg-yellow-400 transition-colors duration-200">
                                            {user.userName.charAt(0).toUpperCase()}{user.userName.charAt(1).toUpperCase()}
                                        </div>
                                    </button>

                                    {/* Dropdown menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                                                <p className="font-medium">{user.userName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                <p className="text-sm text-gray-500">{user.id}</p>
                                            </div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};
