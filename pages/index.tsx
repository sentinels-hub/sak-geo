/**
 * SAK-Geo entry point.
 *
 * Routes:
 *   /              → Project list (if authenticated) or Login
 *   /projects/:id  → Map editor with Core API persistence (sites + placements)
 *   /demo          → Standalone editor with MemPersistence (no API)
 *   /styleguide    → Component style guide
 */

import { GeojsonIO } from 'app/components/geojson_io';
import {
  StrictMode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Router, Switch, useParams } from 'wouter';
import '../styles/globals.css';
import { StyleGuide } from 'app/components/style_guide';
import { UIDMap } from 'app/lib/id_mapper';
import { PersistenceContext } from 'app/lib/persistence/context';
import { MemPersistence } from 'app/lib/persistence/memory';
import { createStore, Provider, useAtomValue, useSetAtom } from 'jotai';
import { Tooltip as T } from 'radix-ui';
import { QueryClient, QueryClientProvider } from 'react-query';
import { dataAtom } from 'state/jotai';
import { isAuthenticatedAtom, currentUserAtom } from 'state/auth';
import { LoginPage } from 'app/components/auth/login-page';
import { ProjectListPage } from 'app/components/project/project-list-page';
import { CatalogSidebar } from 'app/components/catalog/catalog-sidebar';
import {
  listSites,
  sitesToGeoJSON,
  listPlacements,
  placementsToGeoJSON,
  getCurrentUser
} from 'app/lib/core-api';
import { setStoredToken } from 'app/lib/core-api/client';
import type { IWrappedFeature } from 'types';

const queryClient = new QueryClient();

// ── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const setAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const [checking, setChecking] = useState(true);

  // On mount, check if stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem('sak-geo-token');
    if (!token) {
      setChecking(false);
      return;
    }

    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setAuthenticated(true);
      })
      .catch(() => {
        setStoredToken(null);
        setAuthenticated(false);
      })
      .finally(() => setChecking(false));
  }, []);

  // Listen for auth expiry events from the API client
  useEffect(() => {
    const handler = () => setAuthenticated(false);
    window.addEventListener('sak-geo:auth-expired', handler);
    return () => window.removeEventListener('sak-geo:auth-expired', handler);
  }, [setAuthenticated]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// ── Project Editor ───────────────────────────────────────────────────────────

function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fresh Jotai store per project
  const storeRef = useRef<{
    store: ReturnType<typeof createStore>;
    id: string | undefined;
  }>({ store: createStore(), id });

  if (storeRef.current.id !== id) {
    storeRef.current = { store: createStore(), id };
  }
  const store = storeRef.current.store;
  const idMap = useRef(UIDMap.empty());

  const persistence = useMemo(
    () => new MemPersistence(idMap.current, store),
    [store]
  );

  // Hydrate: load sites + placements from Core API as GeoJSON features
  useEffect(() => {
    if (!id) {
      setReady(true);
      return;
    }

    setReady(false);
    setError(null);

    // Load sites for the project, then load placements for each site
    listSites(id)
      .then(async (sites) => {
        const featureMap = new Map<string, IWrappedFeature>();
        let atCounter = 0;

        // Add site features
        const siteGeoJSON = sitesToGeoJSON(sites);
        for (const f of siteGeoJSON.features) {
          const fid = String(f.id || `site-${atCounter}`);
          const at = String(atCounter++).padStart(6, '0');
          featureMap.set(fid, { id: fid, at, feature: f as any });
          UIDMap.pushUUID(idMap.current, fid);
        }

        // Load placements for each site
        for (const site of sites) {
          try {
            const placements = await listPlacements(site.id);
            const placementGeoJSON = placementsToGeoJSON(placements);
            for (const f of placementGeoJSON.features) {
              const fid = String(f.id || `placement-${atCounter}`);
              const at = String(atCounter++).padStart(6, '0');
              featureMap.set(fid, { id: fid, at, feature: f as any });
              UIDMap.pushUUID(idMap.current, fid);
            }
          } catch (err) {
            console.warn(`[ProjectEditor] Failed to load placements for site ${site.id}:`, err);
          }
        }

        store.set(dataAtom, { featureMap, selection: { type: 'none' } });
        setReady(true);
      })
      .catch((err) => {
        console.error('[ProjectEditor] hydration failed:', err);
        setError(err.message || 'Failed to load project data');
        setReady(true);
      });
  }, [id, store]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 text-sm">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <a href="/" className="text-blue-600 text-sm hover:underline">
            Back to projects
          </a>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <PersistenceContext.Provider value={persistence}>
        <title>SAK-Geo | Sentinels</title>
        <GeojsonIO />
        <CatalogSidebar />
      </PersistenceContext.Provider>
    </Provider>
  );
}

// ── Demo Editor ──────────────────────────────────────────────────────────────

function DemoEditor() {
  const store = useRef(createStore());
  const idMap = useRef(UIDMap.empty());
  const persistence = useRef<MemPersistence | null>(null);
  if (!persistence.current) {
    persistence.current = new MemPersistence(idMap.current, store.current);
  }
  return (
    <Provider store={store.current}>
      <PersistenceContext.Provider value={persistence.current}>
        <title>SAK-Geo Demo | Sentinels</title>
        <GeojsonIO />
      </PersistenceContext.Provider>
    </Provider>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Suspense fallback={null}>
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <T.Provider>
            <Router>
              <Switch>
                {/* Authenticated routes */}
                <Route path="/">
                  <AuthGate>
                    <ProjectListPage />
                  </AuthGate>
                </Route>
                <Route path="/projects/:id">
                  <AuthGate>
                    <ProjectEditor />
                  </AuthGate>
                </Route>

                {/* Public routes */}
                <Route path="/demo">
                  <DemoEditor />
                </Route>
                <Route path="/styleguide">
                  <StyleGuide />
                </Route>
              </Switch>
            </Router>
          </T.Provider>
        </QueryClientProvider>
      </StrictMode>
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
