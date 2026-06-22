export default function TruthLensIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 420, height: "auto" }}
      aria-label="TruthLens AI detection illustration"
    >
      <defs>
        {/* Grad-CAM heatmap gradient — cool → hot (amber theme) */}
        <radialGradient id="heatCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#d97706" stopOpacity="0.7" />
          <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.0" />
        </radialGradient>
        <radialGradient id="heatSec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.0" />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        {/* Photo-like base gradient */}
        <linearGradient id="photoBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#141008" />
          <stop offset="100%" stopColor="#0e0c08" />
        </linearGradient>
        <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>

        <clipPath id="photoClip">
          <rect x="100" y="60" width="280" height="210" rx="12" />
        </clipPath>

        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* ── Ambient background glow ── */}
      <ellipse cx="240" cy="200" rx="200" ry="160" fill="url(#glow)" />

      {/* ── Image frame ── */}
      <rect
        x="100"
        y="60"
        width="280"
        height="210"
        rx="12"
        fill="url(#photoBase)"
        stroke="#3d2e0a"
        strokeWidth="1.5"
      />

      {/* Simulated portrait silhouette */}
      <g clipPath="url(#photoClip)" opacity="0.9">
        {/* Sky / background */}
        <rect x="100" y="60" width="280" height="130" fill="#1c1507" />
        {/* Ground */}
        <rect x="100" y="190" width="280" height="80" fill="#120f04" />

        {/* Abstract face outline */}
        <ellipse cx="240" cy="145" rx="52" ry="62" fill="#2c1f06" />
        <ellipse cx="240" cy="118" rx="36" ry="40" fill="#3d2e0a" />
        {/* Eyes */}
        <ellipse cx="225" cy="112" rx="7" ry="8" fill="#0e0c08" />
        <ellipse cx="255" cy="112" rx="7" ry="8" fill="#0e0c08" />
        <circle cx="225" cy="111" r="3" fill="#f59e0b" opacity="0.9" />
        <circle cx="255" cy="111" r="3" fill="#f59e0b" opacity="0.9" />
        {/* Nose */}
        <ellipse cx="240" cy="126" rx="5" ry="7" fill="#2a1e05" />
        {/* Mouth */}
        <path
          d="M228 137 Q240 145 252 137"
          stroke="#1c1507"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Neck / shoulders */}
        <rect x="220" y="180" width="40" height="25" rx="6" fill="#2c1f06" />
        <ellipse cx="240" cy="220" rx="70" ry="30" fill="#221803" />

        {/* Subtle AI artifact texture */}
        <rect
          x="100"
          y="60"
          width="280"
          height="210"
          fill="#f59e0b"
          opacity="0.03"
          filter="url(#grain)"
        />

        {/* ── Grad-CAM heatmap overlays ── */}
        <ellipse
          cx="240"
          cy="120"
          rx="64"
          ry="68"
          fill="url(#heatCore)"
          opacity="0.82"
        />
        <ellipse
          cx="230"
          cy="108"
          rx="28"
          ry="22"
          fill="url(#heatSec)"
          opacity="0.65"
        />
        <ellipse
          cx="252"
          cy="108"
          rx="22"
          ry="18"
          fill="url(#heatSec)"
          opacity="0.55"
        />
        {/* Tertiary — background artifacts */}
        <ellipse
          cx="148"
          cy="88"
          rx="24"
          ry="18"
          fill="#78350f"
          opacity="0.18"
        />
        <ellipse
          cx="335"
          cy="95"
          rx="20"
          ry="15"
          fill="#78350f"
          opacity="0.14"
        />
      </g>

      {/* ── Scan line animation ── */}
      <rect
        x="100"
        y="60"
        width="280"
        height="40"
        rx="0"
        fill="url(#scanLine)"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;0,175;0,0"
          dur="3s"
          repeatCount="indefinite"
          calcMode="easeInOut"
        />
      </rect>

      {/* ── Corner brackets ── */}
      {[
        [100, 60, 1, 1],
        [380, 60, -1, 1],
        [100, 270, 1, -1],
        [380, 270, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${sx},${sy})`}>
          <path
            d="M0 18 L0 0 L18 0"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}

      {/* ── Heatmap scale legend ── */}
      <defs>
        <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#44403c" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect
        x="148"
        y="286"
        width="184"
        height="7"
        rx="3.5"
        fill="url(#legendGrad)"
        opacity="0.85"
      />
      <text x="146" y="304" fill="#a16207" fontSize="9" fontFamily="monospace">
        LOW
      </text>
      <text
        x="308"
        y="304"
        fill="#a16207"
        fontSize="9"
        fontFamily="monospace"
        textAnchor="end"
      >
        HIGH
      </text>
      <text
        x="240"
        y="304"
        fill="#a16207"
        fontSize="9"
        fontFamily="monospace"
        textAnchor="middle"
      >
        ACTIVATION
      </text>

      {/* ── Result badge ── */}
      <rect
        x="148"
        y="320"
        width="184"
        height="38"
        rx="8"
        fill="#f59e0b"
        fillOpacity="0.12"
        stroke="#f59e0b"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <circle cx="172" cy="339" r="6" fill="#f59e0b" fillOpacity="0.9" />
      {/* Pulse ring */}
      <circle
        cx="172"
        cy="339"
        r="10"
        stroke="#f59e0b"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        fill="none"
      >
        <animate
          attributeName="r"
          values="6;13;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          values="0.5;0;0.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x="186"
        y="335"
        fill="#fbbf24"
        fontSize="11"
        fontWeight="600"
        fontFamily="monospace"
      >
        AI GENERATED
      </text>
      <text
        x="186"
        y="350"
        fill="#d97706"
        fontSize="10"
        fontFamily="monospace"
        opacity="0.75"
      >
        confidence: 97.4%
      </text>

      {/* ── Grid lines ── */}
      {[130, 160, 190, 220, 250, 310, 340, 370].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="60"
          x2={x}
          y2="270"
          stroke="#f59e0b"
          strokeOpacity="0.05"
          strokeWidth="1"
        />
      ))}
      {[90, 120, 150, 180, 210, 240].map((y) => (
        <line
          key={`h${y}`}
          x1="100"
          y1={y}
          x2="380"
          y2={y}
          stroke="#f59e0b"
          strokeOpacity="0.05"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
