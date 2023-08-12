import { useRouter } from 'next/router';

export function useNavigate() {
  const router = useRouter();

  return {
    goBack: (path: string, refetch?: boolean) => {
      if (refetch) {
        return router.push(`${path}?refetch=true`, path);
      }

      return router.push(path);
    },
    goUp: (levels?: number, urlVars?: any | null) => {
      levels = levels || 1;

      const split = router.asPath.split('/');

      for (let i = 0; i < levels; i++) {
        split.pop();
      }

      const builtUrlVars: string[] = [];

      if (urlVars) {
        const urlVarKeys = Object.keys(urlVars);

        for (let i = 0; i < urlVarKeys.length; i++) {
          const key = urlVarKeys[i];
          const value = urlVars[key];

          builtUrlVars.push(`${key}=${value}`);
        }
      }

      const builtUrl = split.join('/') + (builtUrlVars.length ? `?${builtUrlVars.join('&')}` : '');

      return router.push(builtUrl);
    },
    goTo: path => {
      return router.push(path);
    },
    reload: () => {
      return router.reload();
    }
  };
}
