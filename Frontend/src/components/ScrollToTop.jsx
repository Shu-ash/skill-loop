// src/components/ScrollToTop.jsx
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Synchronous pre-paint scroll-to-top handler
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Disable smooth scroll temporarily so browser snaps instantly to top 0 before painting
    const htmlElem = document.documentElement;
    const prevScrollBehavior = htmlElem.style.scrollBehavior;
    htmlElem.style.scrollBehavior = 'auto';

    // Reset window and document scroll positions synchronously
    window.scrollTo(0, 0);
    htmlElem.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Reset container scrolls
    const appElem = document.getElementById('app');
    if (appElem) appElem.scrollTop = 0;

    const mainElems = document.querySelectorAll('.main-content, .admin-main-content');
    mainElems.forEach(el => {
      if (el) el.scrollTop = 0;
    });

    // Restore scrollBehavior in next frame
    requestAnimationFrame(() => {
      htmlElem.style.scrollBehavior = prevScrollBehavior;
    });
  }, [pathname]);

  return null;
}
