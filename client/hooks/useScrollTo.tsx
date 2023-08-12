import { useEffect } from 'react';

export const useScrollTo = () => {
  useEffect(() => {
    const path = window.location.hash;

    if (path && path.includes('#')) {
      setTimeout(() => {
        const id = path.replace('#', '');
        const el = window.document.getElementById(id);
        const r = el?.getBoundingClientRect();

        if (window.top && r) {
          window.top.scroll({
            top: scrollY + r.top,
            behavior: 'smooth'
          });
        }
      }, 600);
    }
  }, []);
};
