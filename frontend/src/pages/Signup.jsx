import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('supervisor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await signup(name, email, password, role);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-workspace)',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Decorative background banner */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '280px',
        background: 'linear-gradient(180deg, #0c1428 0%, #172554 100%)',
        zIndex: 0
      }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1,
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.35)',
            marginBottom: '14px'
          }}>
            <Anchor size={28} />
          </div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Create Operator Account
          </h1>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            PortOptimizer Terminal Command Console
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--status-critical-bg)',
            border: '1px solid var(--status-critical-border)',
            color: 'var(--status-critical-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            fontWeight: 500,
            marginBottom: '18px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Capt. John Reynolds"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px'
            }}>
              Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supervisor@port.gov"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px'
            }}>
              Operational Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="supervisor">Shift Supervisor (Command & Dispatch)</option>
              <option value="operator">Berth & Crane Operator</option>
              <option value="planner">Operations & Logistics Planner</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '5px'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginTop: '6px'
            }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>Register & Open Terminal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="divider" style={{ margin: '22px 0 16px 0' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--color-primary)',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Sign In
          </Link>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '14px',
          fontSize: '0.68rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={13} color="var(--status-low-text)" />
          <span>Bcrypt Protected & Encrypted Storage</span>
        </div>
      </div>
    </div>
  );
}
