import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const RouterContext = createContext(null);

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
    state: null
  });

  useEffect(() => {
    const handlePopState = (e) => {
      setLocation({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
        state: e.state || null
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to, options = {}) => {
    const targetPath = typeof to === 'string' ? to : to.pathname || '/';
    const targetState = options.state || null;

    if (options.replace) {
      window.history.replaceState(targetState, '', targetPath);
    } else {
      window.history.pushState(targetState, '', targetPath);
    }

    const [pathname, searchWithQuestion] = targetPath.split('?');
    const search = searchWithQuestion ? `?${searchWithQuestion}` : '';

    setLocation({
      pathname: pathname || '/',
      search,
      state: targetState
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = useMemo(() => ({ location, navigate }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useLocation() {
  const context = useContext(RouterContext);
  if (!context) {
    return { pathname: window.location.pathname, search: window.location.search, state: null };
  }
  return context.location;
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) {
    return (to, options = {}) => {
      if (options.replace) {
        window.location.replace(to);
      } else {
        window.location.assign(to);
      }
    };
  }
  return context.navigate;
}

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const setSearchParams = (params) => {
    const newQuery = new URLSearchParams(params).toString();
    navigate(`${location.pathname}?${newQuery}`);
  };

  return [searchParams, setSearchParams];
}

export function Link({ to, children, style = {}, className = '', onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} style={{ textDecoration: 'none', ...style }} {...props}>
      {children}
    </a>
  );
}

export function Navigate({ to, replace = false, state = null }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [to, replace, state, navigate]);

  return null;
}

export function Route({ path, element }) {
  return element;
}

export function Routes({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  let match = null;
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;

    const { path, element } = child.props;

    if (path === '*' || path === currentPath) {
      match = element;
      break;
    }

    // Dynamic wildcard support (e.g. /doctors/:id)
    if (path && path.includes(':')) {
      const routeParts = path.split('/');
      const currentParts = currentPath.split('/');

      if (routeParts.length === currentParts.length) {
        let isMatch = true;
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) continue;
          if (routeParts[i] !== currentParts[i]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          match = element;
          break;
        }
      }
    }
  }

  return match || null;
}

export default {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  useSearchParams
};
