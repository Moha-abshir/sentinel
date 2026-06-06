import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Shield, Mail, KeyRound } from 'lucide-react';
import './Login.css';

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
        <div className="app-container login-container">
            <div className="glass-panel login-panel">
                
                <div className="login-header">
                    <div className="login-icon">
                        <Shield size={40} color="var(--accent-teal)" />
                    </div>
                    <h2>Sentinel Login</h2>
                    <p className="login-subtext">
                        {step === 1 ? 'Passwordless Authentication' : 'Check your terminal for the code'}
                    </p>
                </div>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div className="input-wrapper">
                            <Mail size={18} color="var(--text-secondary)" className="input-icon" />
                            <input 
                                type="email" 
                                className="input-teal login-input" 
                                placeholder="Email Address" 
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
                        <div className="input-wrapper">
                            <KeyRound size={18} color="var(--text-secondary)" className="input-icon" />
                            <input 
                                type="text" 
                                className="input-teal code-input" 
                                placeholder="6-digit Code" 
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
                            className="btn-back"
                            onClick={() => setStep(1)}
                        >
                            Back to Email
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
