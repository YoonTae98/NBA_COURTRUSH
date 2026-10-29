import React, { useState } from 'react';
import { CLUSTERS } from '../data/mockPlayers';

/**
 * 2D PCA 군집 산점도 (Clean Light Presentation Theme)
 * 프로젝터 및 밝은 조명 환경에서도 각 군집의 점과 텍스트가 명확하게 식별되도록 설계
 */
export default function ClusterScatterMap({ players, targetPlayer, recommendedPlayers = [], onSelectPlayer }) {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  // SVG 뷰박스 크기
  const width = 580;
  const height = 360;
  const padding = 45;

  // PCA 좌표 범위 (kdt_project3.ipynb 실제 모델 결과값: PC1 -7.0~9.0, PC2 -8.5~8.5)
  const minX = -7.5;
  const maxX = 9.5;
  const minY = -9.0;
  const maxY = 9.0;

  const scaleX = (val) => padding + ((val - minX) / (maxX - minX)) * (width - padding * 2);
  const scaleY = (val) => height - (padding + ((val - minY) / (maxY - minY)) * (height - padding * 2));

  const recIds = new Set(recommendedPlayers.map((p) => p.id));

  return (
    <div className="cluster-map-container">
      <div className="cluster-map-header">
        <div>
          <h3 className="section-title">2D 머신러닝 군집화 공간 맵 (PCA Dimensionality Reduction)</h3>
          <p className="section-subtitle">선수 스탯 벡터를 2차원으로 축소하여 유사한 플레이 스타일을 지닌 군집을 시각화합니다.</p>
        </div>
        <div className="cluster-legend">
          {CLUSTERS.map((c) => (
            <div key={c.id} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: c.color }} />
              <span className="legend-label">{c.shortName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cluster-svg-wrapper">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="cluster-svg">
          {/* 축 그리드 라인 */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />

          {/* 군집별 소프트 배경 구역 및 라벨 */}
          {CLUSTERS.map((cluster) => {
            const clusterPlayers = players.filter((p) => p.clusterId === cluster.id);
            if (clusterPlayers.length === 0) return null;
            const avgX = clusterPlayers.reduce((s, p) => s + scaleX(p.pcaX), 0) / clusterPlayers.length;
            const avgY = clusterPlayers.reduce((s, p) => s + scaleY(p.pcaY), 0) / clusterPlayers.length;

            return (
              <g key={cluster.id}>
                <circle
                  cx={avgX}
                  cy={avgY}
                  r="75"
                  fill={cluster.color}
                  fillOpacity="0.08"
                />
                <text
                  x={avgX}
                  y={avgY - 45}
                  textAnchor="middle"
                  fill={cluster.color}
                  fontSize="11.5"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  CLUSTER {cluster.id}
                </text>
              </g>
            );
          })}

          {/* 전체 선수 노드 렌더링 */}
          {players.map((player) => {
            const cx = scaleX(player.pcaX);
            const cy = scaleY(player.pcaY);
            const isTarget = targetPlayer?.id === player.id;
            const isRec = recIds.has(player.id);
            const cluster = CLUSTERS[player.clusterId];

            return (
              <g
                key={player.id}
                className="player-node"
                onClick={() => onSelectPlayer(player)}
                onMouseEnter={() => setHoveredPlayer(player)}
                onMouseLeave={() => setHoveredPlayer(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* 타깃 선수 펄스 효과 링 */}
                {isTarget && (
                  <>
                    <circle cx={cx} cy={cy} r="18" fill="none" stroke="#0284c7" strokeWidth="2.5" opacity="0.4">
                      <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r="10" fill="#0284c7" fillOpacity="0.2" />
                  </>
                )}

                {/* 추천 대체 선수 표시 링 */}
                {isRec && !isTarget && (
                  <circle cx={cx} cy={cy} r="12" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
                )}

                {/* 기본 원형 노드 (흰색 스트로크로 뚜렷하게 분리) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isTarget ? 7.5 : isRec ? 6.5 : 5}
                  fill={isTarget ? '#0284c7' : cluster.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="scatter-circle"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                />

                {/* 타깃 및 추천 선수 이름 라벨 */}
                {(isTarget || isRec) && (
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill={isTarget ? '#0284c7' : '#1e293b'}
                    fontSize={isTarget ? '11.5' : '10.5'}
                    fontWeight="700"
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: '3px',
                      strokeLinecap: 'butt',
                      strokeLinejoin: 'miter'
                    }}
                  >
                    {player.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 마우스 호버 툴팁 (깔끔한 화이트 팝업) */}
        {hoveredPlayer && (
          <div
            className="scatter-tooltip"
            style={{
              left: Math.min(Math.max(scaleX(hoveredPlayer.pcaX), 80), width - 80),
              top: scaleY(hoveredPlayer.pcaY) - 55
            }}
          >
            <div className="tooltip-title">
              <strong>{hoveredPlayer.name}</strong> ({hoveredPlayer.pos} · {hoveredPlayer.team})
            </div>
            <div className="tooltip-sub">
              군집: {CLUSTERS[hoveredPlayer.clusterId].shortName} | 득점: {hoveredPlayer.stats.pts} | 3P%: {(hoveredPlayer.stats.x3p_pct * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
