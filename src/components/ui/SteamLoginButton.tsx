"use client";

import Link from "next/link";
import Image from "next/image";

export function SteamLoginButton() {
  return (
    <Link 
      href="/api/auth/steam"
      className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 group"
    >
      <div className="transform transition-all duration-200 ease-out group-hover:scale-[1.02] group-hover:brightness-110 group-active:scale-[0.98]">
        <Image
          src="https://community.fastly.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
          alt="Sign in through Steam"
          width={180}
          height={35}
          priority
          unoptimized // Use Steam's CDN directly
          className="transform transition-all duration-200"
          draggable={false}
        />
      </div>
    </Link>
  );
}
