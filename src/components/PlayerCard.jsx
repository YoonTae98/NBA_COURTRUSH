import React from 'react';
import { CLUSTERS } from '../data/mockPlayers';
import { ArrowRightLeft, UserCheck, Shield, Target } from 'lucide-react';

export default function PlayerCard({
  player,
  similarity,
  isTarget = false,
  onCompare,
  onSetTarget
}) {
  const cluster = CLUSTERS[player.clusterId];

  return (
    <div
      className={`player-card ${isTarget ? 'is-target' : ''}`}
      style={{
        borderLeft: `4px solid ${cluster.color}`
      }}
    >
      <div className="card-top">
        <div className="player-meta">
          <div className="player-avatar-wrap">
            <img
              src={player.imgUrl || 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png'}
              alt={player.name}
              className="player-avatar-img"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png';
              }}
            />
          </div>
          <div>
            <h4 className="player-name" title={player.name}>{player.name}</h4>
            <div className="player-subinfo">
              <span className="badge-pos">{player.pos}</span>
              <span className="badge-team">{player.team}</span>
              <span className="badge-age">나이: {player.age}세</span>
            </div>
          </div>
        </div>

        {player.knnData && (
          <div className="similarity-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: player.knnData.distance < 1.5 ? '#059669' : player.knnData.distance < 2.5 ? '#0284c7' : '#d97706',
              background: player.knnData.distance < 1.5 ? '#dcfce7' : player.knnData.distance < 2.5 ? '#e0f2fe' : '#fef3c7',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {player.knnData.tier}
            </span>
            <span className="sim-label" style={{ fontSize: '0.72rem', color: '#64748b' }}>
              전술 거리: <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>{player.knnData.distance}</strong>
            </span>
          </div>
        )}
        {!player.knnData && similarity && (
          <div className="similarity-badge">
            <span className="sim-label">적합도 점수</span>
            <span className="sim-value">{similarity}점</span>
          </div>
        )}

        {isTarget && (
          <div className="target-pill">
            <Target size={14} /> 대체 대상 선수
          </div>
        )}
      </div>

      <div className="cluster-tag" style={{ color: cluster.color, backgroundColor: `${cluster.color}15` }}>
        <Shield size={12} style={{ marginRight: 4 }} />
        {cluster.name}
      </div>

      <div className="card-stats-grid">
        <div className="stat-box">
          <span className="stat-label">36분 득점</span>
          <span className="stat-val">{player.stats.pts}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">리바운드</span>
          <span className="stat-val">{player.stats.trb}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">어시스트</span>
          <span className="stat-val">{player.stats.ast}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">3점 성공률</span>
          <span className="stat-val">{(player.stats.x3p_pct * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="card-actions">
        {!isTarget && onCompare && (
          <button className="btn-compare" onClick={() => onCompare(player)}>
            <ArrowRightLeft size={14} /> 1:1 스탯 비교
          </button>
        )}
        {!isTarget && onSetTarget && (
          <button className="btn-set-target" onClick={() => onSetTarget(player)} title="이 선수를 대체 대상으로 재선정">
            <UserCheck size={14} /> 대체 대상 설정
          </button>
        )}
      </div>
    </div>
  );
}
