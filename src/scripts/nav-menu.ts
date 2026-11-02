// Progressive enhancement for the mobile <details> menu (spec §6): close it after an in-page link is chosen
// (otherwise the open panel covers the section the visitor jumped to) and on Escape, returning focus to "Menu".
// Without JS the <details> still opens and its links still work.
for (const menu of document.querySelectorAll<HTMLDetailsElement>('details.nav-menu')) {
  const summary = menu.querySelector('summary');

  menu.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) menu.open = false;
  });

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary?.focus();
    }
  });
}
