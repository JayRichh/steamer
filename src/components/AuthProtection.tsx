"use client";

import { useEffect, useState } from "react";

import { Container } from "~/components/ui/Container";
import { Spinner } from "~/components/ui/Spinner";

export function AuthProtection({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/steam/user");
        const data = await response.json();

        if (!data.isLoggedIn) {
          window.location.href = "/";
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  return children;
}
