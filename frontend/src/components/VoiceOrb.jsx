export default function VoiceOrb({ state, onClick }) {
  return (
    <button className={`orb-container ${state}`} onClick={onClick} aria-label="Voice orb">
      <span className={`orb-ring ring1 ${state}`} />
      <span className={`orb-ring ring2 ${state}`} />
      <span className={`orb-ring ring3 ${state}`} />
      <span className={`orb-core ${state}`}>
        <span className="orb-highlight" />
      </span>
    </button>
  );
}
