import React from 'react';

/**
 * 6각 레이더 차트 (Clean Light Presentation Theme)
 * 프로젝터 및 밝은 실내에서도 라인과 수치가 선명하게 보이도록 고대비 컬러 적용
 */
export default function RadarChart({ p1, p2, size = 320 }) {
  const categories = [
    { key: 'scoring', label: '득점 볼륨 (PTS)' },
    { key: 'shooting3p', label: '3점 외곽포 (3P)' },
    { key: 'playmaking', label: '플레이메이킹 (AST)' },
    { key: 'rebounding', label: '리바운드 (TRB)' },
    { key: 'rimDefense', label: '골밑 수호 (BLK)' },
    { key: 'perimeterDefense', label: '외곽 수비 (STL)' }
  ];

  const total = categories.length;
  // 라벨 텍스트 잘림 방지를 위해 반경을 컴팩트하게 조정
  const radius = size * 0.30;
  const center = size / 2;

  // 축 각도 계산
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // 배경 6각형 그리드 레벨 (20, 40, 60, 80, 100)
  const levels = [20, 40, 60, 80, 100];

  const getPolygonPoints = (player) => {
    if (!player || !player.radar) return '';
    return categories
      .map((cat, i) => {
        const val = player.radar[cat.key] || 0;
        const { x, y } = getCoordinates(i, val);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const p1Points = getPolygonPoints(p1);
  const p2Points = p2 ? getPolygonPoints(p2) : null;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* 타깃 선수 채우기 그라디언트 (고채도 오션 블루) */}
          <linearGradient id="p1GradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.12" />
          </linearGradient>
          {/* 비교 선수 채우기 그라디언트 (고채도 포레스트 에메랄드) */}
          <linearGradient id="p2GradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* 배경 동심원 그리드 (밝은 회색 및 외곽선 선명하게) */}
        {levels.map((lvl) => {
          const pts = categories
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill={lvl === 100 ? '#f8fafc' : 'none'}
              stroke={lvl === 100 ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={lvl === 100 ? '1.5' : '1'}
              strokeDasharray={lvl === 100 ? 'none' : '3,3'}
            />
          );
        })}

        {/* 축 라인 */}
        {categories.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
          );
        })}

        {/* 라벨 텍스트 (텍스트 잘림 방지를 위해 방향별 스마트 앵커 적용) */}
        {categories.map((cat, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const labelDist = radius + 18;
          let x = center + labelDist * cos;
          let y = center + labelDist * sin;

          let anchor = 'middle';
          if (cos > 0.25) {
            anchor = 'start';
            x += 2;
          } else if (cos < -0.25) {
            anchor = 'end';
            x -= 2;
          }

          const yOffset = sin > 0.5 ? 10 : sin < -0.5 ? -3 : 4;

          return (
            <text
              key={cat.key}
              x={x}
              y={y + yOffset}
              textAnchor={anchor}
              fill="#1e293b"
              fontSize="10.5"
              fontWeight="700"
              style={{ pointerEvents: 'none' }}
            >
              {cat.label}
            </text>
          );
        })}

        {/* 비교 선수 폴리곤 (있을 경우) */}
        {p2Points && (
          <polygon
            points={p2Points}
            fill="url(#p2GradLight)"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* 기준 선수 폴리곤 */}
        {p1Points && (
          <polygon
            points={p1Points}
            fill="url(#p1GradLight)"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* 기준 선수 데이터 포인트 */}
        {categories.map((cat, i) => {
          const val = p1?.radar?.[cat.key] || 0;
          const { x, y } = getCoordinates(i, val);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}

        {/* 비교 선수 데이터 포인트 */}
        {p2 && categories.map((cat, i) => {
          const val = p2?.radar?.[cat.key] || 0;
          const { x, y } = getCoordinates(i, val);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
