"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              About SteamShare
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your personal Steam screenshot manager. Capture, organize, and share your gaming
              memories.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
              <Link
                href="/steam"
                className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Profile
              </Link>
              <Link
                href="/editor"
                className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Screenshot Editor
              </Link>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Steam Resources</h3>
            <div className="flex flex-col space-y-2">
              <a
                href="https://store.steampowered.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Steam Store
              </a>
              <a
                href="https://steamcommunity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Steam Community
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {currentYear} SteamShare. Not affiliated with Valve Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}
