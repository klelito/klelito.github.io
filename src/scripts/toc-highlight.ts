// Marks the table-of-contents link of the section currently in view with aria-current="true".
// Progressive enhancement: without JS the TOC is a plain list of anchor links.
const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc-link')];
const targets = links
  .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
  .filter((el): el is HTMLElement => el !== null);

function setCurrent(id: string) {
  for (const link of links) {
    if (decodeURIComponent(link.hash.slice(1)) === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

if (targets.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setCurrent(visible[0].target.id);
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  targets.forEach((el) => observer.observe(el));
  setCurrent(targets[0].id);
}
