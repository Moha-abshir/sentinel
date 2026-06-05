import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, Plus, Globe, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Connect to WebSocket server for live updates
    const { lastMessage, isConnected } = useWebSocket('ws://localhost:3000');

    useEffect(() => {
        fetchMonitors();
    }, []);

    // Listen for WebSocket updates to modify the monitors state instantly
    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.type === 'STATUS_CHANGED') {
            setMonitors((prev) => 
                prev.map(m => m.id === lastMessage.monitorId 
                    ? { ...m, status: lastMessage.newStatus } 
                    : m
                )
            );
        }
        
        // If we wanted to flash latency on the card, we could listen to 'NEW_RESULT' here
    }, [lastMessage]);

    const fetchMonitors = async () => {
        try {
            const res = await api.getMonitors();
            setMonitors(res.data);
        } catch (err) {
            setError('Failed to load monitors');
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const onlineCount = monitors.filter(m => m.status === 'online').length;
    const offlineCount = monitors.filter(m => m.status === 'offline').length;

    return (
        <div className="app-container">
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity color="var(--accent-teal)" size={36} />
                        Sentinel Dashboard
                    </h1>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                            Live Feed {isConnected ? 'Active' : 'Disconnected'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} color="var(--status-online)"/> {onlineCount} Online
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldAlert size={16} color="var(--status-offline)"/> {offlineCount} Offline
                        </span>
                    </div>
                </div>
                
                <button className="btn-teal" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    New Monitor
                </button>
            </div>

            {error && <div style={{ color: 'var(--status-offline)', marginBottom: '2rem' }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading infrastructure...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {monitors.length === 0 ? (
                        <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No monitors created yet. Click 'New Monitor' to start tracking.
                        </div>
                    ) : (
                        monitors.map((monitor) => (
                            <div 
                                key={monitor.id} 
                                className="glass-panel" 
                                style={{ padding: '1.5rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                onClick={() => navigate(`/monitor/${monitor.id}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
                                        {monitor.name}
                                    </h3>
                                    <div className={`status-dot ${monitor.status || 'offline'}`} title={monitor.status} />
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Globe size={14} />
                                        {new URL(monitor.url).hostname}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={14} />
                                        Checks every {monitor.interval}s
                                    </span>
                                </div>

                                {/* Subtle accent bar at bottom for quick visual status */}
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    left: 0, 
                                    right: 0, 
                                    height: '4px', 
                                    background: monitor.status === 'online' ? 'var(--status-online)' : 'var(--status-offline)',
                                    opacity: 0.5
                                }} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
