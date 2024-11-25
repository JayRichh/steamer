"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { Tooltip } from "~/components/ui/Tooltip";
import { SteamLoginButton } from "~/components/ui/SteamLoginButton";
import type { SteamPersonaState, SteamUser } from "~/types/steam";
import { STEAM_PERSONA_STATES, getPersonaStateColor } from "~/types/steam";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Dashboard", href: "/dashboard", requiresAuth: true },
  { name: "Editor", href: "/editor", requiresAuth: true },
  { name: "Profile", href: "/steam", requiresAuth: true },
  { name: "Inventory", href: "/inventory", requiresAuth: true },
];

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setError(null);
        const response = await fetch("/api/auth/steam/user", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const data = await response.json();

        if (response.ok && data.isLoggedIn) {
          setSteamUser(data.user);
          setIsLoggedIn(true);
        } else if (!response.ok && response.status !== 401) {
          throw new Error("Unable to verify login status. Please try again later.");
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      setError(null);
      const response = await fetch("/api/auth/steam", { 
        method: "POST",
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to log out. Please try again.");
      }
      
      // Clear client-side state
      setSteamUser(null);
      setIsLoggedIn(false);
      
      // Revalidate all auth-dependent paths
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: [
            '/',
            '/dashboard',
            '/editor',
            '/steam',
            '/inventory',
            '/api/auth/steam/user',
            '/api/steam/games',
            '/api/steam/friends',
            '/api/steam/inventory'
          ]
        })
      });
      
      // Navigate to home page and force a full router refresh
      router.push('/');
      router.refresh();
      
      // Force a complete page reload after navigation
      window.location.reload();
      
    } catch (error) {
      console.error("Logout failed:", error);
      setError(error instanceof Error ? error.message : "Failed to log out");
    }
  };

  const personaState = steamUser
    ? ((steamUser.personastate ?? STEAM_PERSONA_STATES.OFFLINE) as SteamPersonaState)
    : (STEAM_PERSONA_STATES.OFFLINE as SteamPersonaState);
  const stateColor = getPersonaStateColor(personaState);

  return (
    <>
      <motion.nav
        className="sticky top-0 z-50 border-b border-border/50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-accent/[0.02] to-secondary/[0.02]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-black tracking-tight hover:text-primary transition-colors">
                SteamShare
              </Link>

              <div className="hidden md:flex ml-10 space-x-1">
                {navigation.map((item) => {
                  if (item.requiresAuth && !isLoggedIn) return null;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        isActive
                          ? "text-primary"
                          : "hover:text-primary"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Spinner size="sm" variant="primary" />
                </div>
              ) : !isLoggedIn ? (
                <SteamLoginButton />
              ) : (
                <div className="flex items-center space-x-4">
                  {steamUser && (
                    <Tooltip content="Go To Profile" position="bottom">
                      <Link href="/steam" className="flex items-center group">
                        <div className="relative">
                          <motion.img
                            src={steamUser.avatarmedium}
                            alt={steamUser.personaname}
                            width={32}
                            height={32}
                            className="rounded-full ring-2 ring-primary/20"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          />
                          <div
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${stateColor.replace("text-", "bg-")} border-2 border-background dark:border-background`}
                          />
                        </div>
                        <span className="ml-2 text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">
                          {steamUser.personaname}
                        </span>
                      </Link>
                    </Tooltip>
                  )}
                  <Button onClick={handleLogout} variant="secondary" size="sm" className="font-bold">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {error && (
        <motion.div 
          className="fixed top-20 left-0 right-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-error/10 text-error text-sm font-medium px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-error hover:text-error/80 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
