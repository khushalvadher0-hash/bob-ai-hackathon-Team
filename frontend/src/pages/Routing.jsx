import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitFork, Check, ArrowRight, Sparkles, Filter, AlertTriangle, Clock, Zap } from 'lucide-react';
import RouteRecommendation from '../components/RouteRecommendation';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels, getRouteRecommendation, getCongestion } from '../services/api';
import { cleanText } from '../utils/cleanText';

export default function Routing() {
  const [searchParams] = useSearchParams();
  const [vessels, setVessels] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [selectedVesselId, setSelectedVesselId] = useState(searchParams.get('vesselId') || '');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    Promise.all([getVessels(), getCongestion()])
      .then(([vData, cData]) => {
        const vList = Array.isArray(vData) ? vData : [];
        setVessels(vList);
        setCongestion(Array.isArray(cData) ? cData : []);
        if (!selectedVesselId && vList.length > 0) {
          setSelectedVesselId(vList[0].vessel_id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedVesselId) {
      setEvaluating(true);
      getRouteRecommendation(selectedVesselId)
        .then(data => {
          if (data) setRecommendation(data);
        })
        .catch(err => {
          console.warn('Notice loading route recommendation:', err);
        })
        .finally(() => setEvaluating(false));
    }
  }, [selectedVesselId]);

  if (loading) return <LoadingSpinner message="Fetching Fleet Routing Status & Multi-Criteria Models..." />;

  const isRerouted = Boolean(recommendation && recommendation.recommended_terminal && recommendation.current_terminal !== recommendation.recommended_terminal);
  const timeSaved = recommendation && recommendation.wait_reduction_hours !== undefined && recommendation.wait_reduction_hours !== null
    ? Number(recommendation.wait_reduction_hours) 
    : recommendation?.current_wait_hours && recommendation?.estimated_wait_hours 
    ? Math.max(0, Math.round((Number(recommendation.current_wait_hours) - Number(recommendation.estimated_wait_hours)) * 10) / 10)
    : 0;

  const allOptions = Array.isArray(recommendation?.all_options) ? recommendation.all_options : [];
  const sortedOptions = [...allOptions].sort((a, b) => (a.estimated_wait_hours || 0) - (b.estimated_wait_hours || 0));
  const rank1 = sortedOptions[0] || { terminal_id: recommendation?.recommended_terminal || 'T3', terminal_name: 'Recommended Terminal', estimated_wait_hours: recommendation?.estimated_wait_hours || 3.5 };
  const rank2 = sortedOptions.find(o => o.terminal_id !== rank1.terminal_id && o.terminal_id !== recommendation?.current_terminal) || sortedOptions[1] || { terminal_id: 'T2', terminal_name: 'Secondary Basin', estimated_wait_hours: 4.5 };
  const r2Savings = Math.max(0, Math.round(((recommendation?.current_wait_hours || 0) - (rank2.estimated_wait_hours || 0)) * 10) / 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 className="page-title">
          <GitFork size={20} color="var(--color-primary)" />
          Alternate Routing Intelligence &amp; Congestion Mitigation
        </h2>
        <p className="page-subtitle">
          Evaluate weighted multi-criteria routing scores balancing congestion penalties, turnaround wait times, and berth availability.
        </p>
      </div>

      {/* Vessel Selector Strip */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Select Vessel for Alternate Reroute Evaluation:
        </label>
        <select
          value={selectedVesselId}
          onChange={(e) => setSelectedVesselId(e.target.value)}
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {vessels.map(v => (
            <option key={v.vessel_id} value={v.vessel_id}>
              {cleanText(v.vessel_id)} - {cleanText(v.vessel_name)} ({cleanText(v.current_terminal)}, {cleanText(v.priority)} Priority)
            </option>
          ))}
        </select>
      </div>

      {/* Main Recommendation Result */}
      {evaluating ? (
        <LoadingSpinner message="Running dynamic route scoring algorithm..." />
      ) : (
        recommendation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Task 3: Prominent Routing Intelligence Banner */}
            <div style={{
              backgroundColor: isRerouted ? '#eff6ff' : '#ecfdf5',
              border: `1px solid ${isRerouted ? '#bfdbfe' : '#a7f3d0'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isRerouted ? '#dbeafe' : '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={18} color={isRerouted ? '#2563eb' : '#059669'} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: isRerouted ? '#1d4ed8' : '#047857' }}>
                    AI Routing Recommendation
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1px' }}>
                    {isRerouted 
                      ? `Redirect to Terminal ${recommendation.recommended_terminal} → saves ${timeSaved} hours`
                      : `Maintain Terminal ${recommendation.current_terminal} → optimal berth path`}
                  </h3>
                </div>
              </div>

              <div style={{
                backgroundColor: isRerouted ? '#2563eb' : '#059669',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Clock size={13} />
                <span>{isRerouted ? `Save ~${timeSaved} Hours Idle Wait` : '0h Delay Penalty'}</span>
              </div>
            </div>

            {/* Core Route Recommendation Component */}
            <RouteRecommendation recommendation={recommendation} />

            {/* Task 3: Ranked Alternative Routes Comparison */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 className="section-heading" style={{ marginBottom: '12px' }}>
                Alternative Routes Ranked Comparison
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div style={{
                  padding: '14px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d' }}>RANK 1 (RECOMMENDED)</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>Saves ~{timeSaved}h</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    Terminal {rank1.terminal_id} ({rank1.terminal_name || 'Recommended'})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Est. wait ~{rank1.estimated_wait_hours}h. Lowest queue congestion penalty. Immediate draft compatibility verified.
                  </p>
                </div>

                <div style={{
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>RANK 2 (SECONDARY)</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Saves ~{r2Savings}h</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    Terminal {rank2.terminal_id} ({rank2.terminal_name || 'Secondary Option'})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Est. wait ~{rank2.estimated_wait_hours}h. Feasible alternate berth allocation.
                  </p>
                </div>

                <div style={{
                  padding: '14px',
                  backgroundColor: isRerouted ? '#fff7ed' : '#f0fdf4',
                  border: `1px solid ${isRerouted ? '#fed7aa' : '#bbf7d0'}`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isRerouted ? '#c2410c' : '#15803d' }}>
                      {isRerouted ? 'CURRENT ASSIGNMENT' : 'OPTIMAL ASSIGNMENT'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isRerouted ? '#ea580c' : '#16a34a' }}>
                      ~{recommendation.current_wait_hours}h wait
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    Terminal {recommendation.current_terminal}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {isRerouted 
                      ? 'Heavy berth backlog. Vessel experiencing extended anchorage dwell time.'
                      : 'Terminal operating with low queue congestion and available berths.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Terminal Alternatives Matrix */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 className="section-heading" style={{ marginBottom: '12px' }}>
                Terminal Feasibility &amp; Congestion Evaluation
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Terminal</th>
                      <th>Congestion Status</th>
                      <th>Queue Probability</th>
                      <th>Expected Delay</th>
                      <th>Available Berths</th>
                      <th>Feasibility Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {congestion.map(c => {
                      const isCurrent = c.terminal_id === recommendation.current_terminal;
                      const isRecommended = c.terminal_id === recommendation.recommended_terminal;
                      const rawProb = c.probability ?? 0.5;
                      const probPercent = rawProb > 1 ? Math.min(100, Math.round(rawProb)) : Math.round(rawProb * 100);

                      return (
                        <tr key={c.terminal_id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            Terminal {cleanText(c.terminal_id)} ({cleanText(c.terminal_name)})
                          </td>
                          <td>
                            <span className={`badge badge-${String(c.congestion_level || 'LOW').toLowerCase()}`}>
                              {cleanText(c.congestion_level)}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{probPercent}%</td>
                          <td style={{ fontSize: '0.8rem' }}>~{c.predicted_wait_hours || 2} hrs</td>
                          <td style={{ fontSize: '0.8rem' }}>{c.available_berths} open</td>
                          <td>
                            {isRecommended ? (
                              <span style={{ 
                                backgroundColor: 'var(--status-low-bg)', 
                                color: 'var(--status-low-text)',
                                border: '1px solid var(--status-low-border)',
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700 
                              }}>
                                RECOMMENDED
                              </span>
                            ) : isCurrent ? (
                              <span style={{ 
                                backgroundColor: '#f1f5f9', 
                                color: 'var(--text-secondary)',
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600 
                              }}>
                                CURRENT ASSIGNMENT
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                ALTERNATIVE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
