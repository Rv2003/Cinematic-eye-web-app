export function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#d4af37",
          animation: "umbra-pulse 1.4s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes umbra-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.5); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}