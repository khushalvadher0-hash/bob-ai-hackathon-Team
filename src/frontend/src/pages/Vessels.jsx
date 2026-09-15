import React, { useState, useEffect } from 'react';
import { Search, Filter, Ship } from 'lucide-react';
import VesselTable from '../components/VesselTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVessels } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Vessels() {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    getVessels()
      .then(data => setVessels(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredVessels = vessels.filter(v => {
    const matchesSearch = v.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.vessel_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || v.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleSelectVessel = (vesselId) => {
    navigate(`/routing?vesselId=${vesselId}`);
  };

  if (loading) return <LoadingSpinner message="Retrieving Vessel Fleet Manifest..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ship size={24} color="var(--color-primary)" />
            Vessel Fleet Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Inbound, queued, and scheduled vessels with priority risk profiles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Search size={16} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search vessel name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                width: '180px'
              }}
            />
          </div>

          {/* Filter Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="ALL" style={{ background: '#111e38' }}>All Priorities</option>
              <option value="HIGH" style={{ background: '#111e38' }}>High Priority</option>
              <option value="MEDIUM" style={{ background: '#111e38' }}>Medium Priority</option>
              <option value="LOW" style={{ background: '#111e38' }}>Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vessels Table Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <VesselTable vessels={filteredVessels} onSelectVessel={handleSelectVessel} />
      </div>
    </div>
  );
}
