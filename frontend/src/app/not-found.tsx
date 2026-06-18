import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0c0c0e",
        color: "#f5f0e8",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(138,92,246,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          top: "20%",
        }}
      />

      {/* 404 number */}
      <h1
        style={{
          fontSize: "clamp(7rem, 15vw, 11rem)",
          fontWeight: 800,
          lineHeight: 1,
          background:
            "linear-gradient(135deg, #8a5cf6 0%, #c084fc 50%, #8a5cf6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.04em",
          position: "relative",
          userSelect: "none",
          margin: "0 0 16px 0",
        }}
      >
        404
      </h1>

      {/* Subtitle */}
      <h2
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "1.5rem",
          letterSpacing: "-0.01em",
          color: "#f5f0e8",
        }}
      >
        Page not found
      </h2>

      <p
        style={{
          marginTop: "12px",
          marginBottom: "32px",
          color: "rgba(245,240,232,0.45)",
          fontFamily: "var(--font-roboto), sans-serif",
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Back button */}
      <Link
        href="/"
        style={{
          textDecoration: "none",
          backgroundColor: "#8a5cf6",
          color: "white",
          padding: "12px 32px",
          borderRadius: "8px",
          fontWeight: 500,
          fontFamily: "var(--font-roboto), sans-serif",
          transition: "background-color 0.2s",
        }}
      >
        Back to Home
      </Link>

      {/* Decorative scan line */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 1,
            backgroundColor: "rgba(138,92,246,0.25)",
          }}
        />
        <span
          style={{
            color: "rgba(245,240,232,0.25)",
            fontFamily: "var(--font-roboto), sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
        >
          TruthLens Forensics
        </span>
        <div
          style={{
            width: 32,
            height: 1,
            backgroundColor: "rgba(138,92,246,0.25)",
          }}
        />
      </div>
    </div>
  );
}
