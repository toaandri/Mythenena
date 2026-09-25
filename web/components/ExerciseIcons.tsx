"use client";

/* ── Respiration : cercle qui pulse ── */
export function IconBreath({ phase }: { phase: string }) {
  const scale = phase === "inhale" ? 1.2 : phase === "exhale" ? 0.75 : 1;
  const opacity = phase === "inhale" ? 0.9 : phase === "exhale" ? 0.3 : 0.6;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Cercle extérieur pulsant */}
      <circle cx="28" cy="28" r="24"
        stroke="#4A9B8E" strokeWidth="2" fill="#4A9B8E"
        fillOpacity={opacity * 0.15}
        style={{ transform: `scale(${scale})`, transformOrigin: "28px 28px", transition: "transform 1.2s ease-in-out, fill-opacity 1.2s" }}
      />
      {/* Cercle intermédiaire */}
      <circle cx="28" cy="28" r="16"
        fill="#4A9B8E" fillOpacity={opacity * 0.25}
        style={{ transform: `scale(${scale * 0.9})`, transformOrigin: "28px 28px", transition: "transform 1.2s ease-in-out 0.1s" }}
      />
      {/* Cercle intérieur */}
      <circle cx="28" cy="28" r="8"
        fill="#4A9B8E" fillOpacity={opacity * 0.7}
        style={{ transform: `scale(${scale * 0.8})`, transformOrigin: "28px 28px", transition: "transform 1.2s ease-in-out 0.2s" }}
      />
    </svg>
  );
}

/* ── Scan corporel : petit homme avec zone illuminée ── */
export function IconBody({ phase }: { phase: string }) {
  const isHead  = phase === "Visage & tête";
  const isArms  = phase === "Épaules & bras";
  const isTorso = phase === "Ventre & dos";
  const isLegs  = phase === "Pieds & jambes";

  const col = (active: boolean) => active ? "#9F7AEA" : "#C4C4C4";
  const glow = (active: boolean): React.CSSProperties =>
    active ? { filter: "drop-shadow(0 0 4px #9F7AEA)", transition: "all 0.5s" }
           : { transition: "all 0.5s" };

  return (
    <svg width="44" height="56" viewBox="0 0 44 56" fill="none">
      {/* Tête */}
      <circle cx="22" cy="7" r="6" fill={col(isHead)} style={glow(isHead)} />

      {/* Cou */}
      <rect x="19" y="13" width="6" height="4" rx="2" fill={col(isHead || isTorso)} style={{ transition: "all 0.5s" }} />

      {/* Torse */}
      <rect x="13" y="17" width="18" height="16" rx="4" fill={col(isTorso)} style={glow(isTorso)} />

      {/* Bras gauche */}
      <g style={glow(isArms)}>
        <rect x="4" y="17" width="8" height="5" rx="2.5" fill={col(isArms)} />
        <rect x="3" y="22" width="7" height="5" rx="2.5" fill={col(isArms)}
          style={{ transform: isArms ? "rotate(-15deg)" : "rotate(0deg)", transformOrigin: "6px 24px", transition: "transform 0.5s" }} />
      </g>

      {/* Bras droit */}
      <g style={glow(isArms)}>
        <rect x="32" y="17" width="8" height="5" rx="2.5" fill={col(isArms)} />
        <rect x="34" y="22" width="7" height="5" rx="2.5" fill={col(isArms)}
          style={{ transform: isArms ? "rotate(15deg)" : "rotate(0deg)", transformOrigin: "38px 24px", transition: "transform 0.5s" }} />
      </g>

      {/* Bassin */}
      <rect x="14" y="33" width="16" height="6" rx="3" fill={col(isTorso || isLegs)} style={{ transition: "all 0.5s" }} />

      {/* Jambe gauche */}
      <g style={glow(isLegs)}>
        <rect x="13" y="39" width="8" height="10" rx="3" fill={col(isLegs)}
          style={{ transform: isLegs ? "rotate(-5deg)" : "rotate(0deg)", transformOrigin: "17px 44px", transition: "transform 0.5s" }} />
        <rect x="12" y="49" width="9" height="5" rx="2" fill={col(isLegs)} />
      </g>

      {/* Jambe droite */}
      <g style={glow(isLegs)}>
        <rect x="23" y="39" width="8" height="10" rx="3" fill={col(isLegs)}
          style={{ transform: isLegs ? "rotate(5deg)" : "rotate(0deg)", transformOrigin: "27px 44px", transition: "transform 0.5s" }} />
        <rect x="23" y="49" width="9" height="5" rx="2" fill={col(isLegs)} />
      </g>
    </svg>
  );
}

/* ── Ancrage 5-4-3-2-1 : icônes des 5 sens ── */
export function IconSenses({ phase }: { phase: string }) {
  const isVue    = phase === "5 choses vues";
  const isTouch  = phase === "4 touchées";
  const isOuie   = phase === "3 sons entendus";
  const isOdeur  = phase === "2 odeurs";
  const isGout   = phase === "1 goût";

  const c  = (a: boolean) => a ? "#F6AD55" : "#C4C4C4";
  const glow = (a: boolean): React.CSSProperties =>
    a ? { filter: "drop-shadow(0 0 5px #F6AD55)", transition: "all 0.4s" }
      : { transition: "all 0.4s" };

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">

      {/* VUE — œil en haut au centre */}
      <g style={glow(isVue)}>
        <ellipse cx="28" cy="9" rx="9" ry="5.5" stroke={c(isVue)} strokeWidth="1.8" fill="none" />
        <circle cx="28" cy="9" r="3" fill={c(isVue)} />
        <circle cx="29" cy="8" r="1" fill="white" fillOpacity="0.7" />
      </g>

      {/* TOUCHER — main à gauche */}
      <g style={glow(isTouch)}>
        <path d="M6 28 L6 22 M9 28 L9 20 M12 28 L12 20 M15 28 L15 22 M18 28 L18 24 L18 32 Q18 34 14 34 L8 34 Q6 34 6 32 L6 28Z"
          stroke={c(isTouch)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* OUÏE — oreille à droite */}
      <g style={glow(isOuie)}>
        <path d="M40 20 Q36 20 36 26 Q36 32 40 32 Q42 32 42 30 Q40 30 40 26 Q40 22 42 22 Q46 22 46 28 Q46 36 38 38"
          stroke={c(isOuie)} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="38" cy="39" r="1.2" fill={c(isOuie)} />
      </g>

      {/* ODORAT — nez en bas à gauche */}
      <g style={glow(isOdeur)}>
        <path d="M14 44 Q14 40 18 40 Q22 40 22 44 Q22 47 18 47"
          stroke={c(isOdeur)} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Volutes d'odeur */}
        <path d="M16 38 Q14 35 16 33" stroke={c(isOdeur)} strokeWidth="1.2" strokeLinecap="round" fill="none"
          strokeDasharray={isOdeur ? "0" : "100"} style={{ transition: "stroke-dasharray 0.4s" }} />
        <path d="M19 37 Q21 34 19 32" stroke={c(isOdeur)} strokeWidth="1.2" strokeLinecap="round" fill="none"
          strokeDasharray={isOdeur ? "0" : "100"} style={{ transition: "stroke-dasharray 0.4s" }} />
      </g>

      {/* GOÛT — bouche/langue en bas à droite */}
      <g style={glow(isGout)}>
        <path d="M34 44 Q38 50 42 44" stroke={c(isGout)} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M38 44 L38 48" stroke={c(isGout)} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="38" cy="42" rx="5" ry="3" stroke={c(isGout)} strokeWidth="1.5" fill="none" />
      </g>

    </svg>
  );
}

/* ── Relaxation musculaire ── */
export function IconMuscle({ phase }: { phase: string }) {
  const isContract = phase === "Contractez";
  const color = isContract ? "#FC8181" : "#68D391";
  const armAngle = isContract ? -40 : -10;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Tête */}
      <circle cx="26" cy="8" r="5" fill={color} style={{ transition: "fill 0.5s" }} />
      {/* Torse */}
      <rect x="19" y="14" width="14" height="14" rx="4"
        fill={color} fillOpacity="0.8"
        style={{ transform: isContract ? "scaleY(0.9)" : "scaleY(1)", transformOrigin: "26px 21px", transition: "all 0.5s" }} />
      {/* Bras gauche levé */}
      <g style={{ transform: `rotate(${armAngle}deg)`, transformOrigin: "19px 16px", transition: "transform 0.5s ease-in-out" }}>
        <rect x="8" y="14" width="11" height="5" rx="2.5" fill={color} style={{ transition: "fill 0.5s" }} />
        {/* Biceps gonflé */}
        <ellipse cx="10" cy="16" rx={isContract ? 5 : 3} ry={isContract ? 3.5 : 2.5}
          fill={color} fillOpacity="0.5"
          style={{ transition: "all 0.5s" }} />
      </g>
      {/* Bras droit levé */}
      <g style={{ transform: `rotate(${-armAngle}deg)`, transformOrigin: "33px 16px", transition: "transform 0.5s ease-in-out" }}>
        <rect x="33" y="14" width="11" height="5" rx="2.5" fill={color} style={{ transition: "fill 0.5s" }} />
        <ellipse cx="42" cy="16" rx={isContract ? 5 : 3} ry={isContract ? 3.5 : 2.5}
          fill={color} fillOpacity="0.5"
          style={{ transition: "all 0.5s" }} />
      </g>
      {/* Jambes */}
      <rect x="19" y="29" width="6" height="14" rx="3"
        fill={color} fillOpacity="0.7"
        style={{ transform: isContract ? "scaleY(0.95)" : "scaleY(1)", transformOrigin: "22px 36px", transition: "all 0.5s" }} />
      <rect x="27" y="29" width="6" height="14" rx="3"
        fill={color} fillOpacity="0.7"
        style={{ transform: isContract ? "scaleY(0.95)" : "scaleY(1)", transformOrigin: "30px 36px", transition: "all 0.5s" }} />
      {/* Lignes de tension */}
      {isContract && <>
        <path d="M14 10 L10 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
        <path d="M38 10 L42 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </>}
    </svg>
  );
}

/* ── Visualisation apaisante ── */
export function IconVisu({ phase }: { phase: string }) {
  const isClosed  = phase === "Fermez les yeux";
  const isImagine = phase === "Imaginez le lieu";
  const isObserve = phase === "Observez";
  const isFeeling = phase === "Ressentez";

  const skyColor = isClosed ? "#1a1a2e" : isImagine ? "#68B5C8" : isObserve ? "#87CEEB" : "#4A9B8E";

  return (
    <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
      {/* Ciel */}
      <rect x="1" y="1" width="54" height="30" rx="6" fill={skyColor} fillOpacity="0.85"
        style={{ transition: "fill 1.2s" }} />

      {/* Étoiles (yeux fermés) */}
      {isClosed && <>
        <circle cx="12" cy="10" r="1.2" fill="white" fillOpacity="0.9" />
        <circle cx="28" cy="7"  r="1.5" fill="white" fillOpacity="0.9" />
        <circle cx="42" cy="11" r="1.2" fill="white" fillOpacity="0.9" />
        <circle cx="20" cy="16" r="0.9" fill="white" fillOpacity="0.7" />
        <circle cx="36" cy="8"  r="0.9" fill="white" fillOpacity="0.7" />
      </>}

      {/* Soleil (observer / ressentir) */}
      {(isObserve || isFeeling) && (
        <circle cx="42" cy="10" r="6" fill="#F6AD55" fillOpacity="0.95"
          style={{ transition: "all 1s" }} />
      )}

      {/* Nuage (imaginer) */}
      {isImagine && (
        <path d="M16 18 Q14 14 18 13 Q20 9 25 11 Q28 8 32 11 Q36 10 37 14 Q40 14 40 18Z"
          fill="white" fillOpacity="0.8" style={{ transition: "all 1s" }} />
      )}

      {/* Montagne */}
      <path d="M1 31 L14 16 L24 26 L32 18 L44 31 L55 31"
        fill="#4A9B8E" fillOpacity="0.75" style={{ transition: "fill 1s" }} />

      {/* Sol */}
      <rect x="1" y="31" width="54" height="16" rx="0" fill="#68D391" fillOpacity="0.5" />
      <rect x="1" y="39" width="54" height="8" rx="0" fill="#4A9B8E" fillOpacity="0.4" />

      {/* Yeux fermés (phase 1) */}
      {isClosed && (
        <g>
          <path d="M18 22 Q20 20 22 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M30 22 Q32 20 34 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* Sourire (ressentir) */}
      {isFeeling && (
        <path d="M22 38 Q28 43 34 38" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}
