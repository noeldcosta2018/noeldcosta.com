// Runs before first paint so the stored theme never flashes. Hybrid (dark frame,
// light reading areas) is the default; a visitor's own choice is kept. Choices are
// stored under nd-theme-v2: picks saved before hybrid existed (nd-theme) are
// dropped once, so every visitor starts in hybrid.
// Also marks the document for the one orchestrated entrance reveal, only when the
// tab is visible and the visitor has not asked for reduced motion.
const SCRIPT = `(function(){var d=document.documentElement;try{localStorage.removeItem("nd-theme");var t=localStorage.getItem("nd-theme-v2");d.setAttribute("data-theme",t==="light"||t==="dark"||t==="hybrid"?t:"hybrid");}catch(e){d.setAttribute("data-theme","hybrid");}try{if(document.visibilityState==="visible"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("reveal-run");}catch(e){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
