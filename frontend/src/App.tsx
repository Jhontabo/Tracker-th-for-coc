import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import thMasterData from './data/th-master-data.json';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerItem {
  name: string;
  level: number;
  village?: string; // Important: "home" or "builderBase"
}

interface PlayerData {
  name: string;
  tag: string;
  townHallLevel: number;
  builderHallLevel: number;
  heroes: PlayerItem[];
  heroEquipment: PlayerItem[];
  troops: PlayerItem[];
  spells: PlayerItem[];
}

const Section = ({ title, icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="sc-card">
      <div className="sc-card-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{icon} {title}</h3>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="sc-card-content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [tag, setTag] = useState(localStorage.getItem('coc-tag') || '#8GU82UROQ');
  const [village, setVillage] = useState<'home' | 'builder'>('home');
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlayer = async (customTag?: string) => {
    const searchTag = (customTag || tag).trim();
    if (!searchTag) return;
    setLoading(true);
    setError('');
    localStorage.setItem('coc-tag', searchTag);
    try {
      const response = await axios.get(`http://localhost:5000/api/player/${searchTag.replace('#', '%23')}`);
      setPlayer(response.data);
    } catch (err) {
      setError('Could not fetch player. Check tag or backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tag) fetchPlayer(); }, []);

  const getProgressData = (playerItems: PlayerItem[], category: string, level: number, isBuilder: boolean) => {
    const dataSource = isBuilder ? thMasterData.bh_max_levels : thMasterData.th_max_levels;
    const maxLevels = (dataSource as any)[level]?.[category];
    if (!maxLevels) return [];
    
    // Filter by village to avoid name collisions (like Baby Dragon)
    const targetVillage = isBuilder ? "builderBase" : "home";

    return Object.keys(maxLevels).map(name => {
      const playerItem = (playerItems || []).find(i => 
        i.name === name && (i.village === targetVillage || !i.village)
      );
      const current = playerItem?.level || 0;
      const thMax = maxLevels[name];
      return {
        name,
        current,
        thMax,
        percent: (current / thMax) * 100,
        isMaxForTH: current >= thMax
      };
    }).sort((a, b) => a.percent - b.percent);
  };

  const calculateTotalProgress = () => {
    if (!player) return 0;
    const isBuilder = village === 'builder';
    const level = isBuilder ? player.builderHallLevel : player.townHallLevel;
    
    let all: any[] = [];
    if (!isBuilder) {
      const heroes = getProgressData(player.heroes, 'heroes', level, false);
      const equipment = getProgressData(player.heroEquipment, 'equipment', level, false);
      const pets = getProgressData(player.troops, 'pets', level, false);
      const troops = getProgressData(player.troops, 'troops', level, false);
      const spells = getProgressData(player.spells, 'spells', level, false);
      all = [...heroes, ...equipment, ...pets, ...troops, ...spells];
    } else {
      const heroes = getProgressData(player.heroes, 'heroes', level, true);
      const troops = getProgressData(player.troops, 'troops', level, true);
      all = [...heroes, ...troops];
    }

    if (all.length === 0) return 0;
    return all.reduce((acc, item) => acc + item.percent, 0) / all.length;
  };

  return (
    <div className="sc-container">
      <header className="sc-header">
        <h1 className="sc-title">Elite Tracker</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            className="sc-btn" 
            style={{ background: village === 'home' ? 'var(--sc-gold)' : 'var(--sc-blue-card)', color: village === 'home' ? '#000' : '#fff' }}
            onClick={() => setVillage('home')}
          >🏠 Main Village</button>
          <button 
            className="sc-btn" 
            style={{ background: village === 'builder' ? 'var(--sc-gold)' : 'var(--sc-blue-card)', color: village === 'builder' ? '#000' : '#fff' }}
            onClick={() => setVillage('builder')}
          >🌙 Builder Base</button>
        </div>
        
        <div className="sc-search-box">
          <input className="sc-input" value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} placeholder="#PLAYERTAG" />
          <button className="sc-btn" onClick={() => fetchPlayer()} disabled={loading}>{loading ? '...' : 'Track'}</button>
        </div>
      </header>

      {player && (
        <div className="sc-grid-main">
          <div className="sc-sections">
            {village === 'home' ? (
              <>
                <Section title="Heroes & Pets" icon="🛡️" defaultOpen={true}>
                  {[...getProgressData(player.heroes, 'heroes', player.townHallLevel, false), ...getProgressData(player.troops, 'pets', player.townHallLevel, false)].map(item => (
                    <div key={item.name} className="sc-item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>{item.name}</span><span style={{ color: item.isMaxForTH ? 'var(--sc-gold)' : 'white' }}>{item.current} / {item.thMax}</span></div>
                      <div className="sc-progress-mini"><div className="sc-progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: 'var(--sc-gold)' }}></div></div>
                    </div>
                  ))}
                </Section>
                <Section title="Hero Equipment" icon="⚔️">
                  {getProgressData(player.heroEquipment, 'equipment', player.townHallLevel, false).filter(i => i.current > 0).map(item => (
                    <div key={item.name} className="sc-item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>{item.name}</span><span style={{ color: item.isMaxForTH ? 'var(--sc-gold)' : 'white' }}>{item.current} / {item.thMax}</span></div>
                      <div className="sc-progress-mini"><div className="sc-progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: 'var(--sc-elixir)' }}></div></div>
                    </div>
                  ))}
                </Section>
                <Section title="Laboratory" icon="🧪">
                  {[...getProgressData(player.troops, 'troops', player.townHallLevel, false), ...getProgressData(player.spells, 'spells', player.townHallLevel, false)].map(item => (
                    <div key={item.name} className="sc-item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>{item.name}</span><span style={{ color: item.isMaxForTH ? 'var(--sc-gold)' : 'white' }}>{item.current} / {item.thMax}</span></div>
                      <div className="sc-progress-mini"><div className="sc-progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: 'var(--sc-elixir)' }}></div></div>
                    </div>
                  ))}
                </Section>
              </>
            ) : (
              <>
                <Section title="Builder Heroes" icon="🦾" defaultOpen={true}>
                  {getProgressData(player.heroes, 'heroes', player.builderHallLevel, true).map(item => (
                    <div key={item.name} className="sc-item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>{item.name}</span><span style={{ color: item.isMaxForTH ? 'var(--sc-gold)' : 'white' }}>{item.current} / {item.thMax}</span></div>
                      <div className="sc-progress-mini"><div className="sc-progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: 'var(--sc-gold)' }}></div></div>
                    </div>
                  ))}
                </Section>
                <Section title="Builder Laboratory" icon="🚀" defaultOpen={true}>
                  {getProgressData(player.troops, 'troops', player.builderHallLevel, true).map(item => (
                    <div key={item.name} className="sc-item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>{item.name}</span><span style={{ color: item.isMaxForTH ? 'var(--sc-gold)' : 'white' }}>{item.current} / {item.thMax}</span></div>
                      <div className="sc-progress-mini"><div className="sc-progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, background: 'var(--sc-dark-elixir)' }}></div></div>
                    </div>
                  ))}
                </Section>
              </>
            )}
          </div>

          <aside className="sc-sidebar">
            <div className="sc-card sc-stat-card" style={{ borderColor: 'var(--sc-gold)' }}>
              <div className="sc-th-badge">{village === 'home' ? `TOWN HALL ${player.townHallLevel}` : `BUILDER HALL ${player.builderHallLevel}`}</div>
              <h2 style={{ margin: '15px 0 5px' }}>{player.name}</h2>
              <div className="sc-stat-val">{calculateTotalProgress().toFixed(1)}%</div>
              <div className="sc-stat-label">{village === 'home' ? 'Home Village' : 'Builder Base'} Completion</div>
            </div>

            <div className="sc-card" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 15px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Next Priorities</h4>
              {(village === 'home' ? [
                ...getProgressData(player.heroes, 'heroes', player.townHallLevel, false), 
                ...getProgressData(player.heroEquipment, 'equipment', player.townHallLevel, false),
                ...getProgressData(player.troops, 'pets', player.townHallLevel, false),
                ...getProgressData(player.troops, 'troops', player.townHallLevel, false),
                ...getProgressData(player.spells, 'spells', player.townHallLevel, false)
              ] : [
                ...getProgressData(player.heroes, 'heroes', player.builderHallLevel, true),
                ...getProgressData(player.troops, 'troops', player.builderHallLevel, true)
              ])
                .filter(i => !i.isMaxForTH)
                .slice(0, 6)
                .map(item => (
                  <div key={item.name} style={{ marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sc-gold)' }}></div>
                    <span>{item.name} <span style={{ color: 'var(--sc-text-muted)' }}>(Lvl {item.current})</span></span>
                  </div>
                ))
              }
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
