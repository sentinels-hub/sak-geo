/**
 * Project picker — lists active projects from Sentinels Core API.
 * User selects a project, then navigates to the map editor for that project.
 */

import { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { listProjects } from 'app/lib/core-api';
import type { CoreProject } from 'app/lib/core-api/types';
import { currentUserAtom } from 'state/auth';
import { useLocation } from 'wouter';

export function ProjectListPage() {
  const [projects, setProjects] = useState<CoreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAtomValue(currentUserAtom);
  const [, navigate] = useLocation();

  useEffect(() => {
    setLoading(true);
    listProjects()
      .then((data) => {
        setProjects(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load projects');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">SAK-Geo</h1>
          </div>
          {currentUser && (
            <span className="text-sm text-gray-500">
              {currentUser.first_name || currentUser.username}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select a project to open the map editor
          </p>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Loading projects...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No active projects found
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white border border-gray-200 rounded-lg px-5 py-4
                           text-left hover:border-blue-300 hover:shadow-sm
                           transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {project.code}
                      {project.client_name && ` · ${project.client_name}`}
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {project.status}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Demo mode link */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate('/demo')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Open demo editor (no API)
          </button>
        </div>
      </main>
    </div>
  );
}
