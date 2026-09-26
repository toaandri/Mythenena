"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Les icônes reçoivent un identifiant de phase stable (inhale, head, vue…)
   et non un libellé traduit, pour rester valides dans les 3 langues. */

/* ── Respiration : le cercle qui se dilate puis se rétracte ── */

export function IconBreath({ phase }: { phase: string }) {
  const inhale = phase === "inhale";
  const hold = phase === "hold";
  const exhale = phase === "exhale";
  const running = inhale || hold || exhale;

  /* Le cercle suit le souffle : plein à l'inspiration, vidé à l'expiration */
  const k = inhale ? 1 : exhale ? 0.55 : hold ? 1 : 0.78;
  const dur = inhale ? "3.4s" : exhale ? "6.4s" : "1.2s";
  const ease = inhale ? "cubic-bezier(0.22, 1, 0.36, 1)" : exhale ? "cubic-bezier(0.65, 0, 0.35, 1)" : "ease-out";

  /* Les particules d'air s'échappent vers l'extérieur quand on expire */
  const airK = exhale ? 1.05 : inhale ? 0.68 : 0.85;
  const airO = exhale ? 0.55 : hold ? 0.34 : 0.24;

  const o = inhale ? 0.5 : exhale ? 0.3 : hold ? 0.65 : 0.38;
  const core = inhale ? 0.95 : exhale ? 0.5 : hold ? 0.8 : 0.55;

  const ring = (r: number, sw: number, scale: number, opacity: number) => (
    <circle
      key={r}
      cx="32" cy="32" r={r}
      stroke="currentColor" strokeWidth={sw} fill="none" opacity={opacity}
      style={{
        transform: `scale(${running ? k * scale : 0.78 * scale})`,
        transformBox: "view-box",
        transformOrigin: "32px 32px",
        transition: `transform ${dur} ${ease}, opacity 0.7s ease-out`,
      }}
    />
  );

  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" className="text-brand" aria-hidden>
      {/* Particules d'air qui s'écartent */}
      <g
        style={{
          transform: `scale(${running ? airK : 0.85})`,
          transformBox: "view-box",
          transformOrigin: "32px 32px",
          transition: `transform ${dur} ${ease}, opacity 0.7s ease-out`,
        }}
        opacity={airO}
        fill="currentColor"
      >
        <circle cx="32" cy="5" r="1.7" />
        <circle cx="59" cy="32" r="1.7" />
        <circle cx="32" cy="59" r="1.7" />
        <circle cx="5" cy="32" r="1.7" />
      </g>

      {/* Cercle extérieur : l'enveloppe du souffle */}
      {ring(27, 1.2, 1, o * 0.5)}
      {/* Cercle médian */}
      {ring(20, 1.8, 0.95, o)}
      {/* Cœur plein */}
      <circle
        cx="32" cy="32" r="10.5"
        fill="currentColor" opacity={core}
        style={{
          transform: `scale(${running ? k * 0.82 : 0.78 * 0.82})`,
          transformBox: "view-box",
          transformOrigin: "32px 32px",
          transition: `transform ${dur} ${ease}, opacity 0.7s ease-out`,
        }}
      />
      {/* Reflet au cœur du cercle */}
      <circle
        cx="29" cy="29" r="3.2"
        fill="white" opacity={core * 0.45}
        style={{
          transform: `scale(${running ? k * 0.82 : 0.78 * 0.82})`,
          transformBox: "view-box",
          transformOrigin: "32px 32px",
          transition: `transform ${dur} ${ease}, opacity 0.7s ease-out`,
        }}
      />
    </svg>
  );
}

/* ── Scan corporel : le petit homme qui fait le mouvement ── */

export function IconBody({ phase }: { phase: string }) {
  const isHead = phase === "head";
  const isArms = phase === "arms";
  const isTorso = phase === "torso";
  const isLegs = phase === "legs";
  const running = isHead || isArms || isTorso || isLegs;

  /* La zone scannée passe en marque, le reste reste en silhouette discrète */
  const part = (active: boolean) =>
    cn(
      "transition-colors duration-500",
      active ? "text-brand" : running ? "text-ink-subtle/70" : "text-ink-subtle",
    );

  const zone = (active: boolean, shape: ReactNode) => (
    <g
      className="fill-brand transition-opacity duration-500"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      opacity={active ? undefined : 0}
    >
      {active && (
        <g className="animate-zone-pulse" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {shape}
        </g>
      )}
    </g>
  );

  const zoneRect = (x: number, y: number, w: number, h: number) => (
    <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 2} fill="currentColor" />
  );

  return (
    <svg width="48" height="68" viewBox="0 0 48 68" fill="none" aria-hidden>
      {/* Halos des quatre zones de scan */}
      {zone(isHead, zoneRect(15.5, 2.5, 17, 16))}
      {zone(isArms, zoneRect(8.5, 17, 31, 25))}
      {zone(isTorso, zoneRect(15.5, 33.5, 17, 13))}
      {zone(isLegs, zoneRect(10.5, 44.5, 27, 21))}

      <g
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        className={isLegs ? "animate-body-bob" : undefined}
        style={{ transformBox: "view-box" }}
      >
        {/* Sol + ondes quand on travaille les pieds */}
        <path
          d="M13 63.5 H35"
          className={cn(part(isLegs), "transition-opacity duration-500")}
          strokeWidth="2" opacity={running ? (isLegs ? 0.9 : 0.35) : 0.35}
        />
        {isLegs && (
          <path
            d="M7 67 Q24 62 41 67"
            className="animate-zone-pulse text-brand" strokeWidth="1.6" opacity="0.5"
            style={{ transformBox: "view-box", transformOrigin: "24px 64px" }}
          />
        )}

        {/* Jambes : elles s'écartent et le corps monte sur la pointe des pieds */}
        <g
          className={part(isLegs)}
          style={{
            transform: isLegs ? "rotate(7deg)" : "rotate(0deg)",
            transformBox: "view-box", transformOrigin: "21px 42px",
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), color 0.5s",
          }}
        >
          <path d="M21 42 L20 53 L20.5 60.5" />
          <path d="M18 62.5 H23" strokeWidth="2" />
        </g>
        <g
          className={part(isLegs)}
          style={{
            transform: isLegs ? "rotate(-7deg)" : "rotate(0deg)",
            transformBox: "view-box", transformOrigin: "27px 42px",
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), color 0.5s",
          }}
        >
          <path d="M27 42 L28 53 L27.5 60.5" />
          <path d="M25 62.5 H30" strokeWidth="2" />
        </g>

        {/* Torse : il s'incline pour porter l'attention au ventre et au dos */}
        <g
          className={part(isTorso)}
          style={{
            transform: isTorso ? "rotate(5deg)" : "rotate(0deg)",
            transformBox: "view-box", transformOrigin: "24px 42px",
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), color 0.5s",
          }}
        >
          {/* Le souffle au ventre */}
          <path
            d="M20.8 33.5 H27.2"
            className={cn("transition-opacity duration-500", isTorso ? "opacity-100" : "opacity-0")}
            strokeWidth="1.8"
          />
        </g>

        {/* Bassin et torse */}
        <rect x="18.6" y="19.5" width="10.8" height="23" rx="5" className={part(isTorso)} />
        <path d="M24 15 V20" className={part(isTorso || isHead)} strokeWidth="2" />

        {/* Bras : ils se soulèvent et s'écartent pour relâcher les épaules */}
        <g
          className={part(isArms)}
          style={{
            transform: isArms ? "rotate(48deg)" : "rotate(0deg)",
            transformBox: "view-box", transformOrigin: "19px 22.5px",
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), color 0.5s",
          }}
        >
          <path d="M19 22.5 L14 31 L15 39.5" />
          <circle cx="15.2" cy="40.4" r="1.6" fill="currentColor" stroke="none" />
        </g>
        <g
          className={part(isArms)}
          style={{
            transform: isArms ? "rotate(-48deg)" : "rotate(0deg)",
            transformBox: "view-box", transformOrigin: "29px 22.5px",
            transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), color 0.5s",
          }}
        >
          <path d="M29 22.5 L34 31 L33 39.5" />
          <circle cx="32.8" cy="40.4" r="1.6" fill="currentColor" stroke="none" />
        </g>

        {/* Tête : elle bascule doucement d'un côté à l'autre */}
        <g
          className={cn(part(isHead), isHead && "animate-head-roll")}
          style={{ transformBox: "view-box", transformOrigin: "24px 15.2px" }}
        >
          <circle cx="24" cy="9.5" r="5.4" />
          {isHead && (
            <g className="animate-fade-in">
              <path d="M21.2 9.2 Q22.3 8 23.4 9.2" strokeWidth="1.6" />
              <path d="M24.6 9.2 Q25.7 8 26.8 9.2" strokeWidth="1.6" />
              <path d="M22.2 12.2 Q24 13.6 25.8 12.2" strokeWidth="1.6" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}

/* ── Ancrage 5-4-3-2-1 : les cinq sens ── */

const SENSES = {
  vue: [32, 13],
  ouie: [50.1, 26.1],
  gout: [43.2, 47.4],
  odeur: [20.8, 47.4],
  toucher: [13.9, 26.1],
} as const;

function Sense({ at, active, children }: { at: readonly [number, number]; active: boolean; children: ReactNode }) {
  const [x, y] = at;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r="8.2"
        className={cn("fill-brand transition-opacity duration-500", active ? "fill-opacity-15" : "fill-opacity-0")}
      />
      <g
        className={cn("transition-transform duration-500 ease-out", active && "scale-[1.18]")}
        style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}
      >
        <g
          className={cn("transition-colors duration-500", active ? "text-brand" : "text-ink-subtle/55")}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        >
          {children}
        </g>
      </g>
    </g>
  );
}

export function IconSenses({ phase }: { phase: string }) {
  const isVue = phase === "vue";
  const isOuie = phase === "ouie";
  const isOdeur = phase === "odeur";
  const isGout = phase === "gout";
  const isTouch = phase === "toucher";

  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      {/* Le cercle qui relie les cinq sens */}
      <circle cx="32" cy="32" r="19" className="text-line-strong" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="32" cy="32" r="1.4" fill="currentColor" className="text-line-strong" opacity="0.6" />

      {/* VUE — l'œil */}
      <Sense at={SENSES.vue} active={isVue}>
        <path d="M-6.4 0 C-3.6 -4.6 3.6 -4.6 6.4 0 C3.6 4.6 -3.6 4.6 -6.4 0 Z" />
        <circle cx="0" cy="0" r="2.5" fill="currentColor" stroke="none" />
      </Sense>

      {/* OUÏE — l'oreille */}
      <Sense at={SENSES.ouie} active={isOuie}>
        <path d="M-3 -6.2 C1 -6.2 3.2 -3.8 3.2 -1 C3.2 0.9 1.7 1.1 1 1.9 C0.4 2.6 0.6 3.4 0 4.4 C-0.6 5.4 -2 5.8 -3 4.8" />
        <path d="M-2.3 -3.4 C-0.2 -3.5 -0.1 -2.2 -0.6 -0.6" />
      </Sense>

      {/* GOÛT — la bouche */}
      <Sense at={SENSES.gout} active={isGout}>
        <path d="M-6 0.2 C-4 -2.6 -1.8 -2.8 0 -1.2 C1.8 -2.8 4 -2.6 6 0.2 C4 4 2 5.2 0 5.2 C-2 5.2 -4 4 -6 0.2 Z" />
        <path d="M-2.4 2.4 C-1 3.4 1 3.4 2.4 2.4" />
      </Sense>

      {/* ODORAT — le nez */}
      <Sense at={SENSES.odeur} active={isOdeur}>
        <path d="M0 -5.8 C-1.8 -3.2 -2.6 -1.4 -2.6 0.6" />
        <path d="M0 -5.8 C1.8 -3.2 2.6 -1.4 2.6 0.6" />
        <path d="M-2.8 1.4 C-1.6 4.6 1.6 4.6 2.8 1.4" />
        <circle cx="-1.4" cy="2.4" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="1.4" cy="2.4" r="0.75" fill="currentColor" stroke="none" />
        <path d="M-4.6 -2.6 C-5.8 -3.6 -5.8 -4.8 -4.8 -5.8" strokeWidth="1.3" />
        <path d="M4.6 -2.6 C5.8 -3.6 5.8 -4.8 4.8 -5.8" strokeWidth="1.3" />
      </Sense>

      {/* TOUCHER — la main */}
      <Sense at={SENSES.toucher} active={isTouch}>
        <path d="M-2.2 0.4 L-2.2 1.6 C-2.2 4.8 -0.7 6 1.2 6 C3.1 6 4.6 4.8 4.6 1.6 L4.6 0.4" />
        <path d="M-2 0.6 L-2 -3.6" />
        <path d="M0.1 0.6 L0.1 -5.4" />
        <path d="M2.3 0.6 L2.3 -5" />
        <path d="M4.4 0.8 L4.4 -3.2" />
        <path d="M-2.2 1.4 C-4.4 1 -4.7 -0.4 -4 -2" />
      </Sense>
    </svg>
  );
}

/* ── Relaxation musculaire ── */

export function IconMuscle({ phase }: { phase: string }) {
  const isContract = phase === "contract";
  const armAngle = isContract ? 30 : 10;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className={isContract ? "text-danger" : "text-success"}>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="26" cy="8" r="5" fill="currentColor" stroke="none" />
        <rect
          x="19" y="14" width="14" height="14" rx="4" fill="currentColor" fillOpacity="0.35"
          style={{
            transform: isContract ? "scaleY(0.9)" : "scaleY(1)",
            transformBox: "view-box", transformOrigin: "26px 21px",
            transition: "transform 0.5s ease-in-out",
          }}
        />
        {/* Bras gauche levé */}
        <g
          style={{
            transform: `rotate(${armAngle}deg)`, transformBox: "view-box", transformOrigin: "19px 16px",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <path d="M19 16 L11 19" />
          <ellipse
            cx="10" cy="19" rx={isContract ? 5 : 3} ry={isContract ? 3.5 : 2.5}
            fill="currentColor" fillOpacity="0.4" stroke="none"
            style={{ transition: "all 0.5s" }}
          />
        </g>
        {/* Bras droit levé */}
        <g
          style={{
            transform: `rotate(${-armAngle}deg)`, transformBox: "view-box", transformOrigin: "33px 16px",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <path d="M33 16 L41 19" />
          <ellipse
            cx="42" cy="19" rx={isContract ? 5 : 3} ry={isContract ? 3.5 : 2.5}
            fill="currentColor" fillOpacity="0.4" stroke="none"
            style={{ transition: "all 0.5s" }}
          />
        </g>
        {/* Jambes */}
        <path d="M22 28 L21.5 42" fillOpacity="0.7" />
        <path d="M30 28 L30.5 42" fillOpacity="0.7" />
      </g>
      {/* Lignes de tension */}
      {isContract && (
        <>
          <path d="M14 10 L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
          <path d="M38 10 L42 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
        </>
      )}
    </svg>
  );
}

/* ── Visualisation apaisante ── */

export function IconVisu({ phase }: { phase: string }) {
  const isClosed = phase === "close";
  const isImagine = phase === "imagine";
  const isObserve = phase === "observe";
  const isFeeling = phase === "feel";

  const skyClass = isClosed
    ? "fill-[#0f172a]"
    : isImagine
      ? "fill-brand"
      : isObserve
        ? "fill-brand/70"
        : "fill-accent/80";

  return (
    <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
      {/* Ciel */}
      <rect
        x="1" y="1" width="54" height="30" rx="6"
        className={cn(skyClass, "stroke-line-strong transition-colors duration-1000")}
        strokeWidth="1" fillOpacity={isClosed ? 1 : 0.85}
      />

      {/* Étoiles (yeux fermés) */}
      {isClosed && (
        <g className="animate-fade-in">
          <circle cx="12" cy="10" r="1.2" fill="white" fillOpacity="0.9" />
          <circle cx="28" cy="7" r="1.5" fill="white" fillOpacity="0.9" />
          <circle cx="42" cy="11" r="1.2" fill="white" fillOpacity="0.9" />
          <circle cx="20" cy="16" r="0.9" fill="white" fillOpacity="0.7" />
          <circle cx="36" cy="8" r="0.9" fill="white" fillOpacity="0.7" />
        </g>
      )}

      {/* Soleil (observer / ressentir) */}
      {(isObserve || isFeeling) && (
        <circle
          cx="42" cy="10" r="6" className="fill-warning"
          style={{ transition: "all 1s" }}
        />
      )}

      {/* Nuage (imaginer) */}
      {isImagine && (
        <path
          d="M16 18 Q14 14 18 13 Q20 9 25 11 Q28 8 32 11 Q36 10 37 14 Q40 14 40 18Z"
          className="animate-fade-in fill-white" fillOpacity="0.8"
        />
      )}

      {/* Montagne */}
      <path d="M1 31 L14 16 L24 26 L32 18 L44 31 L55 31" className="fill-brand" fillOpacity="0.8" />

      {/* Sol */}
      <rect x="1" y="31" width="54" height="16" className="fill-success" fillOpacity="0.45" />
      <rect x="1" y="39" width="54" height="8" className="fill-brand" fillOpacity="0.45" />

      {/* Yeux fermés (phase 1) */}
      {isClosed && (
        <g className="animate-fade-in">
          <path d="M18 22 Q20 20 22 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M30 22 Q32 20 34 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* Sourire (ressentir) */}
      {isFeeling && (
        <path
          d="M22 38 Q28 43 34 38" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
          className="animate-fade-in"
        />
      )}
    </svg>
  );
}
