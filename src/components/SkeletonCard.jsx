export default function SkeletonCard() {
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: '0' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60px' }} />
        <div className="skeleton" style={{ height: '18px', width: '80%' }} />
        <div className="skeleton" style={{ height: '14px', width: '100px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div className="skeleton" style={{ height: '22px', width: '70px' }} />
          <div className="skeleton" style={{ height: '36px', width: '90px', borderRadius: '9px' }} />
        </div>
      </div>
    </div>
  );
}
