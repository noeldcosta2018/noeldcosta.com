// Runs before first paint so the stored theme never flashes. Dark is the default.
// Also marks the document for the one orchestrated entrance reveal, only when the
// tab is visible and the visitor has not asked for reduced motion.
const SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("nd-theme");d.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){d.setAttribute("data-theme","dark");}try{if(document.visibilityState==="visible"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("reveal-run");}catch(e){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
