import { memo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, isAuthenticatedAtom } from 'state/auth';
import { catalogSidebarOpenAtom } from 'state/core';
import { logout } from 'app/lib/core-api';
import { useLocation } from 'wouter';

export const MenuBar = memo(function MenuBar() {
  const currentUser = useAtomValue(currentUserAtom);
  const setAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setCatalogOpen = useSetAtom(catalogSidebarOpenAtom);
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="text-white bg-gray-900 font-sans px-3 flex items-center h-[42px]">
      {/* Logo + Name */}
      <a
        href="/"
        className="font-extrabold flex items-center tracking-wide text-base gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        SAK-Geo
      </a>

      <div className="flex-grow" />

      {/* Actions */}
      <div className="flex items-center gap-3 text-xs">
        {/* Catalog button */}
        <button
          onClick={() => setCatalogOpen((open) => !open)}
          className="px-2.5 py-1 rounded text-gray-300 hover:text-white
                     hover:bg-gray-700 transition-colors"
          title="Device Catalog"
        >
          Catalog
        </button>

        {/* Back to projects */}
        <a
          href="/"
          className="px-2.5 py-1 rounded text-gray-300 hover:text-white
                     hover:bg-gray-700 transition-colors"
        >
          Projects
        </a>

        {/* User + Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-700">
            <span className="text-gray-400">
              {currentUser.first_name || currentUser.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
