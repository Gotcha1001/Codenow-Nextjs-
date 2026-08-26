// Ported from the repeated `new Audio("/Put.mp3")` calls in the old
// Navbar.jsx / Footer.jsx. Centralized here so there's one place that
// knows about the asset and one place to silence the console if it's
// missing (e.g. before you've copied Put.mp3 into /public).
export function playClickSound() {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio("/Put.mp3");
    void audio.play().catch(() => {
      // Autoplay can be blocked by the browser, or the file may not be
      // in /public yet — either way, a UI click sound failing silently
      // is fine, it shouldn't ever block navigation.
    });
  } catch {
    // no-op
  }
}
