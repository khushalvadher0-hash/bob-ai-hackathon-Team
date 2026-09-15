import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GitFork, Check, ArrowRight, AlertCircle, RefreshCw, Ship, Compass } from 'lucide-react';
import RouteRecommendation from '../components/RouteRecommendation';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskBadge from '../components/RiskBadge';
import { getVessels, getRouteRecommendation } from '../services/api';

export default function Routing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vessels, setVessels] = useState([]);
  const [selectedVesselId, setSelectedVesselId] = useState(searchParams.get('vesselId') || '');
  const [recommendation, setRecommendation] = useState(null);
  const [loadingVessels, setLoadingVessels] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  // Load available vessels from FastAPI
  useEffect(() => {
    setLoadingVessels(true);
    getVessels()
      .then((data) => {
        const vesselList = Array.isArray(data) ? data : [];
        setVessels(vesselList);

        // If a vesselId query param is present and exists in list, keep it; else default to first vessel
        const paramId = searchParams.get('vesselId');
        if (paramId && vesselList.some(v => v.vessel_id === paramId)) {
          setSelectedVesselId(paramId);
        } else if (vesselList.length > 0 && !selectedVesselId) {
          setSelectedVesselId(vesselList[0].vessel_id);
        }
      })
      .catch((err) => {
        console.error('Error fetching vessels for routing:', err);
        setError('Unable to load vessel inventory. Please check that the backend is running.');
      })
      .finally(() => setLoadingVessels(false));
  }, []);

  // Fetch routing recommendation whenever selected vessel changes
  useEffect(() => {
    if (!selectedVesselId) {
      setRecommendation(null);
      return;
    }

    setEvaluating(true);
    setError(null);

    getRouteRecommendation(selectedVesselId)
      .then((data) => {
        setRecommendation(data);
      })
      .catch((err) => {
        console.error('Error fetching route recommendation:', err);
        setError('Unable to load routing recommendation. Please check that the backend is running.');
        setRecommendation(null);
      })
      .finally(() => setEvaluating(false));
  }, [selectedVesselId]);

  const handleSelectVessel = (id) => {
    setSelectedVesselId(id);
    if (id) {
      setSearchParams({ vesselId: id });
    } else {
      setSearchParams({});
    }
  };

  const handleRefresh = () => {
    if (selectedVesselId) {
      setEvaluating(true);
      getRouteRecommendation(selectedVesselId)
        .then((data) => setRecommendation(data))
        .catch(() => setError('Unable to load routing recommendation.'))
        .finally(() => setEvaluating(false));
    }
  };

  if (loadingVessels) {
    return <LoadingSpinner message="Fetching fleet routing inventory from port backend..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitFork size={26} color="var(--color-primary)" />
            Alternate Routing & Terminal Optimization
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Live AI-driven terminal congestion avoidance and turnaround queue minimization.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={evaluating || !selectedVesselId}
          style={{ fontSize: '0.85rem', opacity: evaluating ? 0.7 : 1 }}
        >
          <RefreshCw size={15} className={evaluating ? 'spin' : ''} />
          Re-evaluate Route
        </button>
      </div>

      {/* Vessel Selector Card */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Ship size={18} color="var(--color-primary)" />
            <label htmlFor="vessel-select" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Select Inbound / Queue Vessel:
            </label>
          </div>

          <select
            id="vessel-select"
            value={selectedVesselId}
            onChange={(e) => handleSelectVessel(e.target.value)}
            style={{
              background: 'rgba(7, 12, 26, 0.7)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '320px',
              maxWidth: '100%'
            }}
          >
            <option value="">-- Choose a vessel --</option>
            {vessels.map((v) => (
              <option key={v.vessel_id} value={v.vessel_id} style={{ background: '#111e38' }}>
                {v.vessel_id} • {v.vessel_name} ({v.current_terminal || 'T1'}, {v.priority || 'MED'} Priority, {v.status || 'QUEUED'})
              </option>
            ))}
          </select>

          {selectedVesselId && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Analyzing real-time berth loads & ML congestion predictions across terminals
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            borderLeft: '4px solid var(--status-critical)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <AlertCircle size={24} color="var(--status-critical)" />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--status-critical)' }}>Routing Error</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State: No Vessel Selected */}
      {!selectedVesselId && !loadingVessels && !error && (
        <div
          className="glass-panel"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <Compass size={48} color="var(--color-primary)" style={{ opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Select a vessel to view the best alternative route</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
            Choose any ship from the dropdown above to run optimization algorithms against live terminal congestion forecasts and draft constraints.
          </p>
        </div>
      )}

      {/* Evaluating Loading State */}
      {evaluating && (
        <LoadingSpinner message="Calculating optimal terminal routing and wait reductions..." />
      )}

      {/* Recommendation & Comparison Matrix */}
      {!evaluating && recommendation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Recommendation Component */}
          <RouteRecommendation recommendation={recommendation} />

          {/* Scored Alternatives Matrix */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Evaluated Terminal Alternatives Matrix
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Evaluated based on draft constraints, active berth queues, and machine learning congestion forecasts.
                </p>
              </div>
            </div>

            {Array.isArray(recommendation.all_options) && recommendation.all_options.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Terminal</th>
                      <th>Congestion Risk</th>
                      <th>Est. Turnaround Wait</th>
                      <th>Available Berths</th>
                      <th>Composite Score</th>
                      <th>Optimization Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendation.all_options.map((opt) => {
                      const isRecommended = opt.terminal_id === recommendation.recommended_terminal;
                      const isCurrent = opt.terminal_id === recommendation.current_terminal;

                      return (
                        <tr
                          key={opt.terminal_id}
                          style={{
                            background: isRecommended ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                            borderLeft: isRecommended ? '3px solid var(--color-primary)' : '3px solid transparent'
                          }}
                        >
                          <td style={{ fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{opt.terminal_id}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                ({opt.terminal_name || `Terminal ${opt.terminal_id}`})
                              </span>
                              {isCurrent && (
                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                  Current
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <RiskBadge level={opt.congestion_level || 'LOW'} />
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            ~{opt.estimated_wait_hours !== undefined ? `${opt.estimated_wait_hours} hrs` : 'N/A'}
                          </td>
                          <td style={{ color: 'var(--text-primary)' }}>
                            {opt.available_berths !== undefined ? `${opt.available_berths} Berths` : 'N/A'}
                          </td>
                          <td style={{ fontWeight: 700, color: isRecommended ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                            {typeof opt.score === 'number' ? opt.score.toFixed(3) : opt.score || '—'}
                          </td>
                          <td>
                            {isRecommended ? (
                              <span
                                style={{
                                  color: 'var(--status-low)',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.8rem',
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  padding: '4px 10px',
                                  borderRadius: '9999px'
                                }}
                              >
                                <Check size={14} /> RECOMMENDED
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Alternative
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No feasible alternative terminal is currently available due to draft or vessel size limits.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

