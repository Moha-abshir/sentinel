import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useWebSocket } from '../hooks/useWebSocket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Globe, Activity, Clock } from 'lucide-react';

export default function MonitorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [monitor, setMonitor] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const { lastMessage, isConnected } = useWebSocket('ws://localhost:3000');

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!lastMessage) return;
        
        // 1. Live Status Change
        if (lastMessage.type === 'STATUS_CHANGED' && lastMessage.monitorId === parseInt(id)) {
            setMonitor(prev => ({ ...prev, status: lastMessage.newStatus }));
        }

        // 2. Live Graph Data Point
        if (lastMessage.type === 'NEW_RESULT' && lastMessage.monitorId === parseInt(id)) {
            const newPoint = {
                time: new Date(lastMessage.result.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                latency: lastMessage.result.response_time,
                success: lastMessage.result.success
            };
            
            // Append and keep last 50 points to prevent memory bloat
            setResults(prev => {
                const updated = [...prev, newPoint];
                if (updated.length > 50) updated.shift();
                return updated;
            });
        }
    }, [lastMessage, id]);

    const fetchData = async () => {
        try {
            const [monitorRes, resultsRes] = await Promise.all([
                api.getMonitorDetails(id),
                api.getResults(id)
            ]);
            
            setMonitor(monitorRes.data);
            
            // Map DB results to chart format
            const chartData = resultsRes.data.map(r => ({
                time: new Date(r.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                latency: r.response_time,
                success: r.success
            }));
            
            setResults(chartData);
        } catch (error) {
            console.error("Failed to fetch monitor details", error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}><div className="status-dot online"></div></div>;
    if (!monitor) return <div className="app-container">Monitor not found</div>;

    return (
        <div className="app-container">
            <button 
                onClick={() => navigate('/')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{monitor.name}</h1>
                        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={16} /> {monitor.url}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Every {monitor.interval}s</span>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '20px', border: `1px solid ${monitor.status === 'online' ? 'var(--status-online)' : 'var(--status-offline)'}` }}>
                            <div className={`status-dot ${monitor.status}`} />
                            <span style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                {monitor.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--accent-teal)" />
                Latency History (Last 24h)
            </h3>
            
            <div className="glass-panel" style={{ padding: '1rem', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            stroke="var(--text-secondary)" 
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                            tickMargin={10} 
                            minTickGap={30}
                        />
                        <YAxis 
                            stroke="var(--text-secondary)" 
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                            tickFormatter={(val) => `${val}ms`}
                            width={60}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-panel-hover)', border: '1px solid var(--accent-teal)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--accent-teal)' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="latency" 
                            stroke="var(--accent-teal)" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: 'var(--accent-teal)', stroke: 'var(--bg-dark)' }}
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
