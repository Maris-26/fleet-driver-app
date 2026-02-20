import { useFleet } from '../app/FleetProvider';
import { devLogger } from '../app/logger.ts';

const console = devLogger;

export default function AlertModal() {
  const { activeAlert, alertBehavior } = useFleet();

  // BUG FIX: Only render based on activeAlert (single source of truth)
  if (!activeAlert || !alertBehavior) {
    console.log('[ALERT_MODAL] Skipping render - missing activeAlert or alertBehavior', {
      hasActiveAlert: !!activeAlert,
      hasAlertBehavior: !!alertBehavior,
      activeAlert: activeAlert ? { incident_id: activeAlert.incident_id, severity: activeAlert.severity } : null,
    });
    return null;
  }

  console.log('[ALERT_MODAL] Rendering popup:', {
    incident_id: activeAlert.incident_id,
    severity: activeAlert.severity,
    behavior: alertBehavior,
    source: activeAlert.source,
  });

  if (alertBehavior === 'HIGH') {
    return <HighAlertCard />;
  }

  if (alertBehavior === 'MEDIUM') {
    return <MediumAlertCard />;
  }

  return null;
}

function HighAlertCard() {
  const { currentEvent, dismissRouting, setCurrentPage, triggerAutoSendMessage, scheduleAutoReply } = useFleet();

  if (!currentEvent) return null;

  const handlePrimary = () => {
    triggerAutoSendMessage();
    scheduleAutoReply();
    setCurrentPage('messages');
    dismissRouting();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={() => dismissRouting()}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 24,
          width: 354,
          height: 263,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Orange Info Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: '#E65100',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          i
        </div>

        {/* Title */}
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', textAlign: 'center', marginTop: 16 }}>
          Action Required
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 1.6, marginTop: 12, flex: 1, display: 'flex', alignItems: 'center' }}>
          Rerouting due to <strong>[Reason]</strong> to stay on schedule.
        </div>

        {/* Auto-send Alert Button */}
        <button
          type="button"
          onClick={handlePrimary}
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: '#E65100',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#CC4400';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#E65100';
          }}
        >
          Auto-send Alert
        </button>
      </div>
    </div>
  );
}

function MediumAlertCard() {
  const { currentEvent, routingDecision, acceptRouting, dismissRouting, activeAlert } = useFleet();

  if (!currentEvent || !activeAlert) return null;

  const isDemoMedium = activeAlert.source === 'demo' && activeAlert.behavior === 'MEDIUM';

  const etaImpact = routingDecision?.routing_decision?.eta_delta_minutes ?? 10;
  const newArrivalTime = routingDecision?.routing_decision?.after_eta || '4:00 PM';
  
  // Split time and AM/PM
  const timeMatch = newArrivalTime.match(/(\d+:\d+)\s*(AM|PM)/i);
  const timeOnly = timeMatch ? timeMatch[1] : '4:00';
  const periodOnly = timeMatch ? timeMatch[2].toUpperCase() : 'PM';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={() => dismissRouting()}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 24,
          width: 354,
          height: 344,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          Better Route Available
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
          Rerouting due to <strong>[Reason]</strong> to stay on schedule.
        </div>

        {/* Time Saved & New Arrival Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: 8,
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            height: 81,
            border: '1px solid #e5e7eb',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 600, textAlign: 'center' }}>Time Saved</div>
          <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 600, textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>New Arrival</div>
          
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', textAlign: 'center' }}>
            {etaImpact} <span style={{ fontWeight: 400, color: '#6b7280' }}>Mins</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>
            {timeOnly} <span style={{ fontWeight: 400, color: '#6b7280' }}>{periodOnly}</span>
          </div>
        </div>

        {/* Update Route Button */}
        <button
          type="button"
          onClick={() => {
            if (isDemoMedium) return;
            acceptRouting();
          }}
          disabled={isDemoMedium}
          title={isDemoMedium ? 'Demo only' : 'Apply backend route update'}
          style={{
            width: 318,
            height: 59,
            backgroundColor: isDemoMedium ? '#9ca3af' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: isDemoMedium ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            alignSelf: 'center',
            opacity: isDemoMedium ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (isDemoMedium) return;
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (isDemoMedium) return;
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
          }}
        >
          {isDemoMedium ? 'Update Route (Demo only)' : 'Update Route'}
        </button>

        {/* No thanks link */}
        <button
          type="button"
          onClick={() => dismissRouting()}
          style={{
            width: '100%',
            padding: 0,
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          No thanks, keep current route
        </button>
      </div>
    </div>
  );
}
