import { useState, useEffect, useCallback } from 'react';

function App() {
  const [isArmed, setIsArmed] = useState(false);
  const [espIp] = useState("10.197.146.26"); 
  const [liveState, setLiveState] = useState("OFFLINE");
  const [scanResult, setScanResult] = useState("---");
  const [enrollId, setEnrollId] = useState(1);
  const [detectionLogs, setDetectionLogs] = useState([]);

  const getStatusColor = useCallback(() => {
    if (liveState.includes("ERROR") || liveState === 'GHOST_TOUCH_DETECTED') return '#ff4444';
    if (liveState.includes("PLACE") || liveState.includes("DETECTED")) return '#ffff00';
    if (liveState === "SUCCESS") return '#00ff88';
    return '#00ff88';
  }, [liveState]);

  useEffect(() => {
    let interval;
    if (isArmed || liveState !== "OFFLINE") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://${espIp}/status`);
          if (res.ok) {
            const data = await res.json();
            setLiveState(data.state);
            
            if (data.result.includes("MATCH FOUND") && data.result !== scanResult) {
              const timestamp = new Date().toLocaleTimeString();
              // FIX S6479: Create a unique object with an ID instead of just a string
              const newLog = {
                id: crypto.randomUUID(), // Generates a unique stable key
                text: `[${timestamp}] ${data.result}`
              };
              setDetectionLogs(prev => [newLog, ...prev].slice(0, 10));
            }
            
            setScanResult(data.result);
          }
        } catch (syncError) {
          console.error("Sync Lost:", syncError);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isArmed, espIp, liveState, scanResult]);

  const toggleScan = async () => {
    const endpoint = isArmed ? '/deactivate' : '/activate';
    try {
      const res = await fetch(`http://${espIp}${endpoint}`, { method: 'POST' });
      if (res.ok) {
        setIsArmed(!isArmed);
      }
    } catch (toggleError) {
      console.error("Node Unreachable:", toggleError);
    }
  };

  const startEnroll = async () => {
    setIsArmed(false);
    try {
      await fetch(`http://${espIp}/enroll?id=${enrollId}`);
    } catch (enrollError) {
      console.error("Enrollment failed:", enrollError);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, borderColor: isArmed ? '#00ff88' : '#333' }}>
        <h1 style={styles.title}>ORGSYS_v1</h1>
        <div style={styles.divider}></div>

        <div style={styles.monitor}>
          <div style={styles.monitorRow}>
            <span style={styles.label}>SENSOR_STATE:</span>
            <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>{liveState}</span>
          </div>
          <div style={styles.monitorRow}>
            <span style={styles.label}>SYSTEM_LOG:</span>
            <span style={{ color: '#fff' }}>{scanResult}</span>
          </div>
        </div>

        {/* ACCESS LOG WINDOW */}
        <div style={styles.logWindow}>
          <div style={styles.label}>DETECTION_HISTORY</div>
          <div style={styles.logContent}>
            {detectionLogs.length === 0 ? (
              <div style={styles.emptyLog}>NO_LOGS_DETECTED</div>
            ) : (
              detectionLogs.map((log) => (
                // FIX S6479: Use the unique ID from the object as the key
                <div key={log.id} style={styles.logEntry}>{log.text}</div>
              ))
            )}
          </div>
        </div>

        <button onClick={toggleScan} style={{ ...styles.button, color: isArmed ? '#ff4444' : '#00ff88' }}>
          {isArmed ? "[ TERMINATE_SCAN ]" : "[ INITIALIZE_SCAN ]"}
        </button>

        <div style={styles.divider}></div>

        <div style={styles.inputGroup}>
          <label htmlFor="enroll-input" style={styles.label}>ENROLL_ID_SLOT (1-127)</label>
          <input 
            id="enroll-input"
            type="number" 
            value={enrollId} 
            onChange={(e) => setEnrollId(Number.parseInt(e.target.value, 10) || 1)} 
            style={styles.input} 
          />
          <button onClick={startEnroll} style={styles.enrollBtn}>
            [ ENROLL_NEW_FINGER ]
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' },
  card: { padding: '30px', border: '1px solid #333', backgroundColor: '#0a0a0a', width: '400px', borderRadius: '8px' },
  title: { fontSize: '1.2rem', textAlign: 'center', color: '#eee', letterSpacing: '4px', margin: '0' },
  divider: { height: '1px', backgroundColor: '#333', margin: '20px 0' },
  monitor: { backgroundColor: '#111', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #222' },
  monitorRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '8px' },
  logWindow: { backgroundColor: '#050505', border: '1px solid #222', padding: '10px', marginBottom: '20px', height: '120px', display: 'flex', flexDirection: 'column' },
  logContent: { overflowY: 'auto', flexGrow: 1, marginTop: '5px' },
  logEntry: { color: '#00ff88', fontSize: '0.65rem', borderLeft: '2px solid #00ff88', paddingLeft: '8px', marginBottom: '4px', opacity: 0.9 },
  emptyLog: { color: '#444', fontSize: '0.65rem', textAlign: 'center', marginTop: '20px' },
  label: { fontSize: '0.6rem', color: '#666', letterSpacing: '1px' },
  button: { width: '100%', padding: '12px', border: '1px solid', cursor: 'pointer', backgroundColor: 'transparent', fontWeight: 'bold', marginBottom: '10px' },
  enrollBtn: { width: '100%', padding: '12px', border: '1px solid #00aaff', color: '#00aaff', cursor: 'pointer', backgroundColor: 'transparent', fontWeight: 'bold', marginTop: '10px' },
  input: { width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#00ff88', padding: '8px', outline: 'none', textAlign: 'center' }
};

export default App;