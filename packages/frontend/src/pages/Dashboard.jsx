import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, Plus, Globe, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import './Dashboard.css';

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
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        <Activity color="var(--accent-teal)" size={36} />
                        Sentinel Dashboard
                    </h1>
                    <div className="dashboard-stats">
                        <span className="stat-item">
                            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                            Live Feed {isConnected ? 'Active' : 'Disconnected'}
                        </span>
                        <span>•</span>
                        <span className="stat-item">
                            <ShieldCheck size={16} color="var(--status-online)"/> {onlineCount} Online
                        </span>
                        <span className="stat-item">
                            <ShieldAlert size={16} color="var(--status-offline)"/> {offlineCount} Offline
                        </span>
                    </div>
                </div>
                
                <button className="btn-teal btn-new-monitor">
                    <Plus size={18} />
                    New Monitor
                </button>
            </div>

            {error && <div className="dashboard-error">{error}</div>}

            {loading ? (
                <div className="dashboard-loading">Loading infrastructure...</div>
            ) : (
                <div className="monitor-grid">
                    {monitors.length === 0 ? (
                        <div className="glass-panel empty-state">
                            No monitors created yet. Click 'New Monitor' to start tracking.
                        </div>
                    ) : (
                        monitors.map((monitor) => (
                            <div 
                                key={monitor.id} 
                                className="glass-panel monitor-card"
                                onClick={() => navigate(`/monitor/${monitor.id}`)}
                            >
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {monitor.name}
                                    </h3>
                                    <div className={`status-dot ${monitor.status || 'offline'}`} title={monitor.status} />
                                </div>
                                
                                <div className="card-details">
                                    <span className="detail-item">
                                        <Globe size={14} />
                                        {new URL(monitor.url).hostname}
                                    </span>
                                    <span className="detail-item">
                                        <Clock size={14} />
                                        Checks every {monitor.interval}s
                                    </span>
                                </div>

                                {/* Subtle accent bar at bottom for quick visual status */}
                                <div className={`accent-bar ${monitor.status === 'online' ? 'accent-online' : 'accent-offline'}`} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
