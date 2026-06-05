import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Shield, Mail, KeyRound } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1); // 1 = Email, 2 = Code
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.requestOTP(email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.verifyOTP(email, code);
            localStorage.setItem('sentinel_token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        padding: '1rem', 
                        borderRadius: '50%', 
                        background: 'rgba(0, 191, 165, 0.1)',
                        marginBottom: '1rem'
                    }}>
                        <Shield size={40} color="var(--accent-teal)" />
                    </div>
                    <h2>Sentinel Login</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {step === 1 ? 'Passwordless Authentication' : 'Check your terminal for the code'}
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        background: 'rgba(255, 82, 82, 0.1)', 
                        border: '1px solid var(--status-offline)', 
                        padding: '12px', 
                        borderRadius: '8px',
                        color: '#ff8a80',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <Mail size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                            <input 
                                type="email" 
                                className="input-teal" 
                                placeholder="Email Address" 
                                style={{ paddingLeft: '44px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-teal" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Login Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <KeyRound size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                            <input 
                                type="text" 
                                className="input-teal" 
                                placeholder="6-digit Code" 
                                style={{ paddingLeft: '44px', letterSpacing: '4px', textAlign: 'center' }}
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-teal" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setStep(1)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--text-secondary)',
                                width: '100%',
                                marginTop: '1rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Back to Email
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
