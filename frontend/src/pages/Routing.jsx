import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitFork, Check, ArrowRight, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import RouteRecommendation from '../components/RouteRecommendation';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels, getRouteRecommendation, getCongestion } from '../services/api';

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
        .then(data => setRecommendation(data))
        .catch(err => console.error(err))
        .finally(() => setEvaluating(false));
    }
  }, [selectedVesselId]);

  if (loading) return <LoadingSpinner message="Fetching Fleet Routing Status..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <GitFork size={22} color="var(--color-primary)" />
          Alternate Routing & Congestion Mitigation
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
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
              {v.vessel_id} - {v.vessel_name} ({v.current_terminal}, {v.priority} Priority)
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
            <RouteRecommendation recommendation={recommendation} />

            {/* Terminal Alternatives Matrix */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Terminal Feasibility & Congestion Evaluation
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

                      return (
                        <tr key={c.terminal_id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            Terminal {c.terminal_id} ({c.terminal_name})
                          </td>
                          <td>
                            <span className={`badge badge-${String(c.congestion_level || 'LOW').toLowerCase()}`}>
                              {c.congestion_level}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{Math.round((c.probability || 0.5) * 100)}%</td>
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
