import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// --- Router Context ---------------------------------------------------------

type RouteState = { path: string; navigate: (to: string) => void };
const RouterContext = createContext<RouteState>({ path: "/", navigate: () => {} });

export function useRouter() {
  return useContext(RouterContext);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "/";
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setPath(hash || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

// --- Route matching helper ---------------------------------------------------

export function matchRoute(currentPath: string, route: string): boolean {
  if (route === "/") return currentPath === "/" || currentPath === "";
  return currentPath === route || currentPath.startsWith(route + "/");
}
