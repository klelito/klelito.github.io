// Reveals the "copy e-mail" buttons only when the Clipboard API exists; the mailto: link always works.
const RESET_AFTER_MS = 2000;

if (navigator.clipboard?.writeText) {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy-email]')) {
    const label = button.textContent ?? '';
    const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail ?? '');
      } catch {
        return; // permission denied or insecure context: the mailto: link remains
      }
      button.textContent = button.dataset.copiedLabel ?? label;
      if (status) status.textContent = button.dataset.copiedLabel ?? '';
      window.setTimeout(() => {
        button.textContent = label;
        if (status) status.textContent = '';
      }, RESET_AFTER_MS);
    });
  }
}
