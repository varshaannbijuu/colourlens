import { useState, useEffect, useRef } from 'react';

/*
  Phase timeline (all driven by CSS transition durations + a single
  requestAnimationFrame-free sequencer):

    0  → mount          – black gradient visible, galaxy opacity 0, text opacity 0
    1  → 600 ms later   – galaxy fades in (2 s CSS transition)
    2  → 2800 ms later  – title fades in (1.2 s)
    3  → 4200 ms later  – tagline fades in (1 s)
    4  → 5600 ms later  – short hold, then call onComplete

  We use a ref-based timer chain so we can clean up on unmount and
  never leave dangling timeouts.  No fake processing delays — these
  durations exist purely to pace the visual transition sequence the
  designer specified.
*/

const PHASE_DELAYS = [0, 600, 2800, 4200, 5600];

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    function advance(nextPhase) {
      if (nextPhase > 4) {
        // Hold one beat then hand off
        timerRef.current = setTimeout(() => onComplete(), 900);
        return;
      }
      setPhase(nextPhase);
      timerRef.current = setTimeout(
        () => advance(nextPhase + 1),
        PHASE_DELAYS[nextPhase] || 0
      );
    }
    advance(1); // kick off from phase 1

    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  return (
    <div className="intro">
      {/* Layer 0: black-to-grey gradient (screenshot 1) — always present */}
      <div className="intro__gradient" />

      {/* Layer 1: galaxy image (screenshot 2) — fades in at phase 1 */}
      <img
        className={`intro__galaxy ${phase >= 1 ? 'visible' : ''}`}
        src="/galaxy.png"
        alt=""
        aria-hidden="true"
      />

      {/* Layer 2: text (screenshot 3) — title at phase 2, tagline at phase 3 */}
      <div className="intro__text">
        <h1 className={`intro__title ${phase >= 2 ? 'visible' : ''}`}>
          ColorLens
        </h1>
        <p className={`intro__tagline ${phase >= 3 ? 'visible' : ''}`}>
          for the ones who never felt color
        </p>
      </div>
    </div>
  );
}
