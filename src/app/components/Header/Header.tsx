"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, hasSession, loading, refreshSession } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const protectedNavigationTalentAcquisition = [
    { name: "Talent Acquisition", href: "/talent-acquisition" },

    { name: "Candidates", href: "/candidates" },
  ];
  const protectedNavigationTechnicalLead = [
    { name: "Technical Lead", href: "/technical-lead" },
  ];
  const protectedNavigationAdmin = [{ name: "Users", href: "/users" }];

  const protectedNavigationBasedOnRole = {
    "Talent Acquisition": protectedNavigationTalentAcquisition,
    "Technical Lead": protectedNavigationTechnicalLead,
    Admin: protectedNavigationAdmin,
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await refreshSession(); // Refresh after logout
      router.push("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <header className="bg-white shadow-lg fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto p-4">
        <Link href="/">
          <Image src="/cbtw.png" alt="Logo" width={100} height={40} priority />
        </Link>
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : !hasSession ? (
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Login
            </Link>
          ) : (
            <>
              {user &&
                protectedNavigationBasedOnRole[
                  user.userType as keyof typeof protectedNavigationBasedOnRole
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                ))}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="bg-yellow-300 rounded-full w-8 h-8 flex items-center justify-center font-bold text-black cursor-pointer"
                >
                  {user?.userName.slice(0, 2).toUpperCase()}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
                    <div className="px-4 py-2 border-b text-sm">
                      <p className="font-medium">{user?.userName}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
