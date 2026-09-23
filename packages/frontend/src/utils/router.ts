import { useState, useEffect } from 'react';

export type AppRoute =
  | { page: 'feed' }
  | { page: 'arena' }
  | { page: 'idea'; ideaId: string };

function parsePath(pathname: string, hash: string): AppRoute {
  // Support either path (/ideas/:id, /arena) or hash (#/ideas/:id, #/arena)
  const path = hash.startsWith('#/') ? hash.slice(1) : pathname;

  if (path === '/arena' || path.startsWith('/arena/') || path === '/showdown' || path.startsWith('/showdown/')) {
    return { page: 'arena' };
  }

  const ideaMatch = path.match(/^\/ideas\/([^/?#]+)/);
  if (ideaMatch) {
    return { page: 'idea', ideaId: ideaMatch[1] };
  }

  return { page: 'feed' };
}

export function navigate(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('app-route-change'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function useCurrentRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() =>
    parsePath(window.location.pathname, window.location.hash)
  );

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(parsePath(window.location.pathname, window.location.hash));
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('app-route-change', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('app-route-change', handleRouteChange);
    };
  }, []);

  return route;
}
