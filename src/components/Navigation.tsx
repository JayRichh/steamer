"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { Tooltip } from "~/components/ui/Tooltip";

import { useHeaderScroll } from "~/hooks/useHeaderScroll";

import type { SteamPersonaState, SteamUser } from "~/types/steam";
import { STEAM_PERSONA_STATES, getPersonaStateColor, getPersonaStateText } from "~/types/steam";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard", requiresAuth: true },
  { name: "Editor", href: "/editor", requiresAuth: true },
  { name: "Profile", href: "/steam", requiresAuth: true },
];

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        const data = await response.json();

        if (response.ok && data.isLoggedIn) {
          setSteamUser(data.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/steam";
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/steam", { method: "POST" });
      setSteamUser(null);
      setIsLoggedIn(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const personaState = steamUser
    ? ((steamUser.personastate ?? STEAM_PERSONA_STATES.OFFLINE) as SteamPersonaState)
    : (STEAM_PERSONA_STATES.OFFLINE as SteamPersonaState);
  const stateColor = getPersonaStateColor(personaState);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              SteamShare
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  if (item.requiresAuth && !isLoggedIn) return null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === item.href
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Spinner size="sm" variant="primary" />
              </div>
            ) : !isLoggedIn ? (
              <Button onClick={handleLogin} className="flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22.5C6.2 22.5 1.5 17.8 1.5 12S6.2 1.5 12 1.5 22.5 6.2 22.5 12 17.8 22.5 12 22.5z" />
                  <path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" />
                </svg>
                <span>Login with Steam</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                {steamUser && (
                  <Tooltip content="Go To Profile" position="bottom">
                    <Link href="/steam" className="flex items-center group">
                      <div className="relative">
                        <img
                          src={steamUser.avatarmedium}
                          alt={steamUser.personaname}
                          className="w-8 h-8 rounded-full"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${stateColor.replace("text-", "bg-")} border-2 border-white dark:border-gray-800`}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {steamUser.personaname}
                      </span>
                    </Link>
                  </Tooltip>
                )}
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
