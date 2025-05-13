import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
    return (
        <header className="text-black bg-whitep-4 shadow-md shadow-gray-200 fixed top-0 w-full">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-gray-300">
                    <Image src="/cbtw.png" alt="Logo" width={100} height={100} />
                </Link>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="hover:text-gray-300">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/talent-adquision" className="hover:text-gray-300">
                            Talent Adquision
                        </Link>
                    </li>

                    <li>
                        <Link href="/technical-lead" className="hover:text-gray-300">
                            Technical Lead
                        </Link>
                    </li>

                </ul>
            </nav>
        </header>
    );
};

export default Header;
