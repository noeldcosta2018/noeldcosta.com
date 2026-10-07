type Target = { href: string; label: string };

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={back ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
    </svg>
  );
}

/** Previous / next pill links at the foot of a step (MDLBeast StepNav). */
export default function StepNav({ prev, next, label }: { prev?: Target; next?: Target; label: string }) {
  return (
    <nav className="nd-stepnav" aria-label={label}>
      {prev && (
        <a href={prev.href}>
          <span className="circ">
            <Arrow back />
          </span>
          <span className="lbl">
            <small>Previous</small>
            <span>{prev.label}</span>
          </span>
        </a>
      )}
      {next && (
        <a className="next" href={next.href}>
          <span className="circ">
            <Arrow />
          </span>
          <span className="lbl">
            <small>Next</small>
            <span>{next.label}</span>
          </span>
        </a>
      )}
    </nav>
  );
}
