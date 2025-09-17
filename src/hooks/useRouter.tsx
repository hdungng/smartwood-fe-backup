import { useNavigate } from 'react-router';
import { useMemo } from 'react';

export function useRouter() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => navigate(0),
      push: (href: string, state?: DynamicObject) =>
        navigate(href, {
          state
        }),
      replace: (href: string) => navigate(href, { replace: true }),
      search: (href: string, search: string) =>
        navigate({
          pathname: href,
          search
        })
    }),
    [navigate]
  );
}
