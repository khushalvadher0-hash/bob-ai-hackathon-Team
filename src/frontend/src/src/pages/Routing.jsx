import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitFork, Check, ArrowRight } from 'lucide-react';
import RouteRecommendation from '../components/RouteRecommendation';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels, getRouteRecommendation } from '../services/api';

export default function Routing() {
  const [searchParams] = useSearchParams();
  const [vessels, setVessels] = useState([]);
  const [selectedVesselId, setSelectedVesselId] = useState(searchParams.get('vesselId') || '');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    getVessels()
      .then(data => {
        setVessels(data);
        if (!selectedVesselId && data.length > 0) {
          setSelectedVesselId(data[0].vessel_id);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={24} color="var(--color-primary)" />
          Alternate Routing & Congestion Avoidance
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evaluate weighted route scores balancing congestion penalties, turnaround wait times, and berth availability.
        </p>
      </div>

      {/* Vessel Selector Strip */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Select Vessel for Reroute Analysis:
        </label>
        <select
          value={selectedVesselId}
          onChange={(e) => setSelectedVesselId(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {vessels.map(v => (
            <option key={v.vessel_id} value={v.vessel_id} style={{ background: '#111e38' }}>
              {v.vessel_id} - {v.vessel_name} ({v.current_terminal}, {v.priority} Priority)
            </option>
          ))}
        </select>
      </div>

      {/* Main Recommendation Result */}
      {evaluating ? (
        <LoadingSpinner message="Running dynamic scoring algorithm..." />
      ) : (
        recommendation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RouteRecommendation recommendation={recommendation} />

            {/* Scored Alternatives Matrix */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
                Evaluated Terminal Score Breakdown (Lower Score = Better Option)
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Terminal</th>
                    <th>Congestion Level</th>
                    <th>Est. Wait</th>
                    <th>Composite Penalty Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(recommendation.all_options || []).map((opt) => {
                    const isSelected = opt.terminal_id === recommendation.recommended_terminal;
                    return (
                      <tr key={opt.terminal_id} style={{ background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent' }}>
                        <td style={{ fontWeight: 600 }}>{opt.terminal_id} - {opt.terminal_name}</td>
                        <td>{opt.congestion_level}</td>
                        <td>~{opt.estimated_wait_hours} hrs</td>
                        <td style={{ fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                          {opt.score}
                        </td>
                        <td>
                          {isSelected ? (
                            <span style={{ color: 'var(--status-low)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                              <Check size={14} /> RECOMMENDED
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Alternate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
