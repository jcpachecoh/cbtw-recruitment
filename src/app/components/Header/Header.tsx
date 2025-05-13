import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Talent Acquisition', href: '/talent-adquision' },
    { name: 'Candidates', href: '/candidates' },
    { name: 'Users', href: '/users' },
];

const Header = () => {
    return (
        <header className="bg-blue-500 text-white p-4 shadow-lg text-black">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image src="/cbtw.png" alt="Logo" width={100} height={100} />
                </Link>
                <ul className="flex space-x-4">
                    {navigation.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="text-black hover:text-gray-300">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
