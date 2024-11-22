"use client";

import { Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { Footer } from "~/components/Footer";
import { JsonLd } from "~/components/JsonLd";
import { Navigation } from "~/components/Navigation";
import { Spinner } from "~/components/ui/Spinner";
import { PageContainer } from "~/components/PageContainer";

function NavigationLoading() {
  return (
    <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <Spinner size="sm" variant="primary" />
    </div>
  );
}

function MainContentLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" variant="primary" />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <JsonLd />
      
      {/* Navigation */}
      <Suspense fallback={<NavigationLoading />}>
        <Navigation />
      </Suspense>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative z-10">
        <Suspense fallback={<MainContentLoading />}>
          <PageContainer>
            {children}
          </PageContainer>
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense>
        <Footer />
      </Suspense>
    </LazyMotion>
  );
}
