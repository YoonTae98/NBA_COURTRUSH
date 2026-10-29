import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Shield,
  Zap,
  Info,
  Globe,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { calculateSimilarity, calculateKNNDistance } from '../data/mockPlayers';

/**
 * 2D 인터랙티브 농구 경기장 전술판 (Basketball Court Tactics Board)
 * 1. 2D 하프코트 위에 5개 포지션(PG, SG, SF, PF, C)의 팀 선발 라인업을 배치합니다.
 * 2. 결장 선수가 위치한 포지션(또는 원하는 포지션)을 클릭하면 해당 군집의 대체 선수 리스트가 나타납니다.
 * 3. 오른쪽에 토글 버튼을 제공하여 [타 팀 영입 후보] vs [같은 팀 내 대체 자원]을 자유롭게 전환할 수 있습니다.
 * 4. 리스트에서 대체 선수를 클릭하면 해당 선수가 즉시 2D 농구 코트의 해당 포지션으로 투입됩니다.
 */
export default function BasketballCourtTactics({
  targetPlayer,
  recommendations,
  clusters,
  allPlayers,
  onCompare
}) {
  // 현재 코트에서 클릭하여 선택한 포지션 (기본값: 결장 타깃 선수의 포지션)
  const [activePos, setActivePos] = useState(targetPlayer?.pos || 'PG');
  
  // 토글 상태: true = 같은 팀 내 대체 자원, false = 타 팀 영입 후보 (리그 전체)
  const [sameTeamOnly, setSameTeamOnly] = useState(false);

  // 코트 각 포지션별 현재 투입된 선수 상태 객체
  // { PG: playerObj, SG: playerObj, SF: playerObj, PF: playerObj, C: playerObj }
  const [courtLineup, setCourtLineup] = useState(() => {
    return initializeLineup(targetPlayer, allPlayers);
  });

  // 결장 선수가 교체 투입된 이력 추적 { [pos]: replacedPlayerObj }
  const [replacedSlots, setReplacedSlots] = useState({});

  // 타깃 선수가 바뀌었을 때 초기 라인업 재설정
  React.useEffect(() => {
    setActivePos(targetPlayer?.pos || 'PG');
    setCourtLineup(initializeLineup(targetPlayer, allPlayers));
    setReplacedSlots({});
    setSameTeamOnly(false);
  }, [targetPlayer?.id]);

  // 포지션별 기본 코트 좌표 (2D 하프코트 기준 백분율) - 4대 전술 롤 매핑
  const positionSlots = [
    {
      pos: 'PG',
      name: '포인트 가드 (Point Guard)',
      roleClusterId: 1, // 메인 플레이메이커
      x: 50,
      y: 22,
      desc: '탑(Top of Key) 메인 볼핸들러 & 플레이메이커'
    },
    {
      pos: 'SG',
      name: '슈팅 가드 (Shooting Guard)',
      roleClusterId: 0, // 득점 전담 에이스
      x: 20,
      y: 38,
      desc: '좌측 윙(Left Wing) 득점 창출 전담 에이스'
    },
    {
      pos: 'SF',
      name: '스몰 포워드 (Small Forward)',
      roleClusterId: 3, // 외곽 3점 슈터
      x: 80,
      y: 38,
      desc: '우측 윙(Right Wing) 외곽 3점 전문 슈터'
    },
    {
      pos: 'PF',
      name: '파워 포워드 (Power Forward)',
      roleClusterId: 0, // 득점 전담 에이스 / 하이브리드 포워드
      x: 32,
      y: 68,
      desc: '하이/미드 포스트 기동력 & 득점/리바운드 밸런스'
    },
    {
      pos: 'C',
      name: '센터 (Center)',
      roleClusterId: 2, // 골밑 수호 빅맨
      x: 68,
      y: 68,
      desc: '페인트존 골밑 장악 수호 빅맨'
    }
  ];

  // 현재 활성화된 포지션에 해당하는 군집 정보
  const activeSlotMeta = positionSlots.find((s) => s.pos === activePos) || positionSlots[0];
  const activeCluster = clusters[activeSlotMeta.roleClusterId] || clusters[0];

  // 같은 팀 내 대체 가능한 총 선수 수 (타깃 선수 제외)
  const sameTeamCandidatesCount = useMemo(() => {
    if (!targetPlayer) return 0;
    return allPlayers.filter(
      (p) => p.team === targetPlayer.team && p.id !== targetPlayer.id
    ).length;
  }, [allPlayers, targetPlayer]);

  // 활성화된 포지션에 매칭되는 추천 대체 선수 후보군 필터링 (토글 상태에 따라 팀 내 vs 리그 전체)
  const availableCandidates = useMemo(() => {
    const currentOccupant = courtLineup[activePos];
    const compareBase = targetPlayer || currentOccupant;

    // 1) 토글 활성화 시: [같은 팀 내 대체 선수 목록]
    if (sameTeamOnly) {
      if (!targetPlayer) return [];
      const teammates = allPlayers.filter(
        (p) => p.team === targetPlayer.team && p.id !== (currentOccupant?.id || targetPlayer.id)
      );

      const scoredTeammates = teammates.map((p) => {
        // 코트 다른 슬롯에 이미 배치되어 있는지 확인
        const placedEntry = Object.entries(courtLineup).find(
          ([posKey, courtP]) => posKey !== activePos && courtP?.id === p.id
        );

        const knn = calculateKNNDistance(compareBase, p);

        return {
          ...p,
          knnData: knn,
          tacticalDistance: knn.distance,
          similarityScore: knn.score.toFixed(1),
          otherSlot: placedEntry ? placedEntry[0] : null
        };
      });

      // 전술 거리 가까운 순으로 정렬 (오름차순)
      scoredTeammates.sort((a, b) => a.tacticalDistance - b.tacticalDistance);
      return scoredTeammates;
    }

    // 2) 토글 비활성화 시: [타 팀 영입 후보군 (리그 전체)]
    // 만약 클릭한 포지션이 타깃 선수의 원래 포지션이면, 기계산된 recommendations 사용
    if (activePos === targetPlayer.pos) {
      return recommendations.slice(0, 25);
    }

    // 다른 포지션을 클릭한 경우: 해당 포지션 또는 해당 군집의 타팀 선수들 매칭
    const basePlayer = currentOccupant || targetPlayer;
    const candidates = allPlayers.filter(
      (p) => p.team !== targetPlayer.team && (p.pos === activePos || p.clusterId === activeSlotMeta.roleClusterId)
    );

    const scored = candidates.map((p) => {
      const knn = calculateKNNDistance(basePlayer, p);
      return {
        ...p,
        knnData: knn,
        tacticalDistance: knn.distance,
        similarityScore: knn.score.toFixed(1)
      };
    });

    scored.sort((a, b) => a.tacticalDistance - b.tacticalDistance);
    return scored.slice(0, 25);
  }, [activePos, targetPlayer, recommendations, allPlayers, sameTeamOnly, courtLineup, activeSlotMeta]);

  // 코트 내 동일 선수가 복수 포지션에 중복 기용되었는지 실시간 감지
  // { [posKey]: { otherPoses: ['PF'], playerName: 'Mobley' } }
  const duplicateSlotsMap = useMemo(() => {
    const map = {};
    for (const [posKey, p] of Object.entries(courtLineup)) {
      if (p?.id) {
        if (!map[p.id]) map[p.id] = [];
        map[p.id].push(posKey);
      }
    }
    const result = {};
    for (const [id, poses] of Object.entries(map)) {
      if (poses.length > 1) {
        for (const p of poses) {
          result[p] = {
            otherPoses: poses.filter((x) => x !== p),
            playerName: courtLineup[p]?.name?.split(' ').pop() || ''
          };
        }
      }
    }
    return result;
  }, [courtLineup]);

  // 대체 선수를 코트 포지션으로 투입하는 액션
  // (동일 선수 중복을 원천 차단하지 않고, 기존 위치에는 주의/보강 표시를 띄워 추후 다른 선수를 충원할 수 있게 허용)
  const handleInsertToCourt = (candidatePlayer) => {
    setCourtLineup((prev) => ({
      ...prev,
      [activePos]: candidatePlayer
    }));

    setReplacedSlots((prev) => ({
      ...prev,
      [activePos]: candidatePlayer
    }));
  };

  // 코트 라인업 원래대로 복원 (초기화)
  const handleResetLineup = () => {
    setCourtLineup(initializeLineup(targetPlayer, allPlayers));
    setReplacedSlots({});
  };

  // 현재 코트 5인 라인업의 종합 평균 스탯 산출
  const courtStats = useMemo(() => {
    const activePlayers = Object.values(courtLineup).filter(Boolean);
    if (activePlayers.length === 0) return { pts: 0, reb: 0, ast: 0, x3p: 0 };
    const pts = (activePlayers.reduce((s, p) => s + (p.stats?.pts || 0), 0) / activePlayers.length).toFixed(1);
    const reb = (activePlayers.reduce((s, p) => s + (p.stats?.trb || 0), 0) / activePlayers.length).toFixed(1);
    const ast = (activePlayers.reduce((s, p) => s + (p.stats?.ast || 0), 0) / activePlayers.length).toFixed(1);
    const x3p = ((activePlayers.reduce((s, p) => s + (p.stats?.x3p_pct || 0), 0) / activePlayers.length) * 100).toFixed(1);
    return { pts, reb, ast, x3p };
  }, [courtLineup]);

  return (
    <div className="court-tactics-container">
      {/* 전술판 헤더 바 */}
      <div className="court-header-bar">
        <div className="court-title-group">
          <div className="tactics-badge">
            <Zap size={14} />
            <span>2D Interactive Court Tactics Simulator</span>
          </div>
          <h3 className="court-main-title">
            2D 농구 경기장 포지션 배치 & 실시간 대체 선수 투입 전술판
          </h3>
          <p className="court-subtitle">
            코트 위의 포지션을 클릭하면 해당 군집의 최적 영입 자원 리스트가 열리며, 선수를 클릭하면 즉시 경기장으로 투입되어 5인 라인업 시너지를 시뮬레이션합니다.
          </p>
        </div>

        <div className="court-header-actions">
          <button className="btn-reset-court" onClick={handleResetLineup} title="원래 선발 라인업으로 복원">
            <RotateCcw size={14} /> 라인업 초기화
          </button>
        </div>
      </div>

      {/* 메인 작업 영역: 좌측 2D 농구 코트 + 우측 실시간 대체 선수 후보 리스트 */}
      <div className="court-tactics-layout">
        {/* =========================================================
            좌측: 2D 농구 경기장 (Hardwood Court Board)
            ========================================================= */}
        <div className="court-board-panel">
          <div className="court-canvas-wrap">
            {/* 2D 농구 코트 SVG 그래픽 */}
            <svg
              className="court-svg"
              viewBox="0 0 600 480"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* 코트 원목 바닥 배경 */}
              <defs>
                <linearGradient id="hardwoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbf3dd" />
                  <stop offset="50%" stopColor="#f5e8c4" />
                  <stop offset="100%" stopColor="#ebd8aa" />
                </linearGradient>
                <pattern id="woodPlanks" width="600" height="24" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="24" x2="600" y2="24" stroke="#e0ce9f" strokeWidth="0.8" opacity="0.6" />
                </pattern>
                <filter id="courtDropShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* 경기장 바닥 */}
              <rect x="15" y="15" width="570" height="450" rx="12" fill="url(#hardwoodGrad)" />
              <rect x="15" y="15" width="570" height="450" rx="12" fill="url(#woodPlanks)" />
              <rect x="15" y="15" width="570" height="450" rx="12" fill="none" stroke="#ffffff" strokeWidth="4" />

              {/* 하프코트 라인 (상단 중앙) */}
              <line x1="15" y1="30" x2="585" y2="30" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="300" cy="30" r="60" fill="none" stroke="#ffffff" strokeWidth="2.5" />

              {/* 3점 라인 (아크 + 양 사이드 코너) */}
              <path
                d="M 65 465 L 65 375 C 65 210, 535 210, 535 375 L 535 465"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
              />

              {/* 페인트 존 (Key / Lane Area) */}
              <rect x="220" y="315" width="160" height="150" fill="rgba(2, 132, 199, 0.08)" stroke="#ffffff" strokeWidth="2.5" />
              
              {/* 자유투 원 (Free Throw Circle) */}
              <circle cx="300" cy="315" r="60" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 6" />

              {/* 골밑 제한구역 아크 (Restricted Area) */}
              <path d="M 270 465 A 30 30 0 0 1 330 465" fill="none" stroke="#ffffff" strokeWidth="2" />

              {/* 백보드 & 림 (Basket Hoop) */}
              <line x1="265" y1="452" x2="335" y2="452" stroke="#ffffff" strokeWidth="4" />
              <circle cx="300" cy="442" r="10" fill="none" stroke="#ea580c" strokeWidth="2.5" />
              <line x1="300" y1="452" x2="300" y2="442" stroke="#ea580c" strokeWidth="2" />
            </svg>

            {/* 5개 포지션 인터랙티브 노드 레이어 */}
            <div className="court-nodes-layer">
              {positionSlots.map((slot) => {
                const currentPlayer = courtLineup[slot.pos];
                const isTargetPos = targetPlayer?.pos === slot.pos;
                const isReplaced = !!replacedSlots[slot.pos];
                const isSelectedSlot = activePos === slot.pos;
                const dupInfo = duplicateSlotsMap[slot.pos];
                const isDuplicate = !!dupInfo;

                return (
                  <div
                    key={slot.pos}
                    className={`court-position-node ${isSelectedSlot ? 'slot-focused' : ''} ${isTargetPos ? 'is-target-slot' : ''} ${isReplaced ? 'is-replaced-slot' : ''} ${isDuplicate ? 'has-duplicate-warning' : ''}`}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`
                    }}
                    onClick={() => setActivePos(slot.pos)}
                  >
                    {/* 포지션 핀 태그 */}
                    <div className="node-pos-pill">
                      <span className="node-pos-name">{slot.pos}</span>
                      {isDuplicate ? (
                        <span className="tag-duplicate-alert" title={`동일 선수가 ${dupInfo.otherPoses.join('/')} 포지션에도 임시 기용 중입니다. 클릭하여 이 자리에 새 선수를 채워보세요!`}>
                          ⚠️ 중복 ({dupInfo.otherPoses.join('/')})
                        </span>
                      ) : isReplaced ? (
                        <span className="tag-replaced">교체완료</span>
                      ) : isTargetPos ? (
                        <span className="tag-absent">결장</span>
                      ) : null}
                    </div>

                    {/* 선수 아바타 프레임 */}
                    <div className={`node-avatar-frame ${isDuplicate ? 'node-avatar-duplicate' : ''}`}>
                      {currentPlayer ? (
                        <img
                          src={currentPlayer.imgUrl || 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png'}
                          alt={currentPlayer.name}
                          className="node-player-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png';
                          }}
                        />
                      ) : (
                        <div className="node-empty-avatar">?</div>
                      )}

                      {/* 동일 선수 중복 기용 시 주의 펄스 링 */}
                      {isDuplicate && (
                        <div className="node-duplicate-pulse-ring" />
                      )}
                      {/* 타깃 결장 선수 펄스 경고 링 */}
                      {!isDuplicate && isTargetPos && !isReplaced && (
                        <div className="node-alert-pulse" />
                      )}
                      {/* 교체 투입 완료 시 에메랄드 링 */}
                      {!isDuplicate && isReplaced && (
                        <div className="node-success-ring" />
                      )}
                    </div>

                    {/* 선수 이름 및 소속 (중복 기용 시 주의 경고 안내 표시) */}
                    <div className={`node-info-plate ${isDuplicate ? 'node-info-duplicate' : ''}`}>
                      <span className="node-player-name" title={currentPlayer?.name || slot.name}>
                        {currentPlayer ? currentPlayer.name.split(' ').pop() : slot.pos}
                      </span>
                      <span className="node-team-name">
                        {isDuplicate ? (
                          <span className="dup-sub-alert">⚠️ {dupInfo.otherPoses.join('/')} 중복 (보강 필요)</span>
                        ) : currentPlayer ? (
                          `${currentPlayer.team} · ${currentPlayer.stats?.pts || 0}P`
                        ) : (
                          '공석'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 코트 하단 실시간 5인 라인업 전술 스탯 바 */}
          <div className="court-lineup-stats-bar">
            {Object.keys(duplicateSlotsMap).length > 0 && (
              <div className="court-duplicate-banner">
                <ShieldAlert size={14} className="banner-alert-icon" />
                <span>
                  <strong>동일 선수 중복 기용 주의:</strong> {Object.values(duplicateSlotsMap)[0]?.playerName} 선수가 복수 포지션에 임시 기용되었습니다. 주의 표시(⚠️)가 뜬 포지션을 클릭하여 새로운 대체 선수를 충원해주세요.
                </span>
              </div>
            )}
            <div className="court-lineup-stats-inner">
              <div className="lineup-title">
                <Shield size={16} />
                <span>현재 코트 5인 라인업 평균 스탯:</span>
              </div>
              <div className="lineup-metrics">
                <span className="metric-item">득점력: <strong>{courtStats.pts}</strong> PTS</span>
                <span className="metric-item">리바운드: <strong>{courtStats.reb}</strong> TRB</span>
                <span className="metric-item">어시스트: <strong>{courtStats.ast}</strong> AST</span>
                <span className="metric-item">3점 성공률: <strong>{courtStats.x3p}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            우측: 해당 포지션/군집 추천 대체 선수 투입 리스트
            ========================================================= */}
        <div className="tactics-candidate-panel">


          {/* 토글 바: 타 팀 영입 후보 vs 동일 팀 내 대체 자원 */}
          <div className="candidate-toggle-bar">
            <div className="tactics-source-tabs">
              <button
                type="button"
                className={`source-tab-btn ${!sameTeamOnly ? 'active' : ''}`}
                onClick={() => setSameTeamOnly(false)}
              >
                <Globe size={13} />
                <span>타 팀 영입 후보</span>
              </button>
              <button
                type="button"
                className={`source-tab-btn ${sameTeamOnly ? 'active' : ''}`}
                onClick={() => setSameTeamOnly(true)}
              >
                <Users size={13} />
                <span>{targetPlayer?.team} 팀 내 대체 자원</span>
                <span className="source-count-pill">{sameTeamCandidatesCount}명</span>
              </button>
            </div>
          </div>

          {/* 1:1 비교 안내 미니 팁 바 */}
          <div className="cand-compare-hint-bar">
            <Sparkles size={12} className="hint-icon" />
            <span>선수 <strong>사진 또는 이름</strong>을 클릭하면 결장 선수와 <strong>1:1 스탯 비교 모달</strong>이 열립니다.</span>
          </div>

          {/* 후보 선수 리스트 스크롤 영역 */}
          <div className="tactics-candidate-list">
            {availableCandidates.length === 0 ? (
              <div className="tactics-empty-state">
                <Users size={32} className="empty-icon" />
                <h5 className="empty-title">팀 내 가용 대체 선수가 없습니다</h5>
                <p className="empty-desc">
                  현재 {targetPlayer?.team} 팀 로스터에 등록된 추가 가용 선수가 없습니다. 상단 토글을 눌러 타 팀 영입 후보를 확인해보세요.
                </p>
                <button
                  type="button"
                  className="btn-switch-league"
                  onClick={() => setSameTeamOnly(false)}
                >
                  <Globe size={13} /> 타 팀 영입 후보 보기
                </button>
              </div>
            ) : (
              availableCandidates.map((cand, idx) => {
                const isCurrentlyOnCourt = courtLineup[activePos]?.id === cand.id;
                const candCluster = clusters ? clusters[cand.clusterId] : null;
                const stocks = ((cand.stats?.stl || 0) + (cand.stats?.blk || 0)).toFixed(1);

                return (
                  <div
                    key={cand.id}
                    className={`candidate-tactics-item ${isCurrentlyOnCourt ? 'is-active-on-court' : ''}`}
                  >
                    <div className="cand-rank-num">#{idx + 1}</div>

                    <div
                      className="cand-photo-wrap clickable-photo"
                      onClick={() => onCompare && onCompare(cand)}
                      title={`${cand.name} 클릭 시 1:1 스탯 비교 모달 열기`}
                    >
                      <img
                        src={cand.imgUrl || 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png'}
                        alt={cand.name}
                        className="cand-photo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png';
                        }}
                      />
                      <span className="photo-vs-badge">VS</span>
                    </div>

                    <div className="cand-info-col">
                      {/* 1행: 선수명, 팀, 포지션, 소속 군집 롤 배지 */}
                      <div className="cand-name-row">
                        <span
                          className="cand-name-text clickable-name"
                          title={`${cand.name} (클릭 시 1:1 스탯 비교)`}
                          onClick={() => onCompare && onCompare(cand)}
                        >
                          {cand.name}
                        </span>
                        <span className="cand-team-pill">{cand.team}</span>
                        <span className="cand-pos-pill">{cand.pos}</span>
                        {candCluster && (
                          <span
                            className="cand-cluster-badge"
                            style={{
                              color: candCluster.color,
                              background: `${candCluster.color}15`,
                              border: `1px solid ${candCluster.borderColor || candCluster.color + '40'}`
                            }}
                            title={`군집 ${candCluster.id}: ${candCluster.name}`}
                          >
                            {candCluster.name}
                          </span>
                        )}
                        {cand.otherSlot && (
                          <span
                            className="cand-warning-icon-pill"
                            title={`현재 ${cand.otherSlot} 출전 중 (투입 시 ${cand.otherSlot} 위치에 중복 주의 표시)`}
                          >
                            <AlertTriangle size={12} />
                          </span>
                        )}
                      </div>

                      {/* 2행: 핵심 스탯 칩 (득점, 리바운드, 어시스트, 3P%, FG%) */}
                      <div className="cand-stat-chips-row">
                        <span className="cand-stat-chip">
                          <span className="chip-lbl">PTS</span>
                          <strong className="chip-val">{cand.stats?.pts || 0}</strong>
                        </span>
                        <span className="cand-stat-chip">
                          <span className="chip-lbl">TRB</span>
                          <strong className="chip-val">{cand.stats?.trb || 0}</strong>
                        </span>
                        <span className="cand-stat-chip">
                          <span className="chip-lbl">AST</span>
                          <strong className="chip-val">{cand.stats?.ast || 0}</strong>
                        </span>
                        <span className="cand-stat-chip">
                          <span className="chip-lbl">3P</span>
                          <strong className="chip-val">{((cand.stats?.x3p_pct || 0) * 100).toFixed(0)}%</strong>
                        </span>
                        <span className="cand-stat-chip">
                          <span className="chip-lbl">FG</span>
                          <strong className="chip-val">{((cand.stats?.fg_pct || 0) * 100).toFixed(0)}%</strong>
                        </span>
                      </div>

                      {/* 3행: 프로필 메타 정보 (나이, 시즌 출전수, 종합 수비 Stocks) */}
                      <div className="cand-meta-line">
                        <span>만 {cand.age}세</span>
                        <span>·</span>
                        <span>시즌 {cand.g || 0}경기 출전</span>
                        <span>·</span>
                        <span>수비 기여 <strong>{stocks} Stocks</strong></span>
                      </div>
                    </div>

                    <div className="cand-action-col">
                      <div className="cand-sim-badge">
                        <span className="sim-lbl">전술 거리</span>
                        <span
                          className="sim-num"
                          style={{
                            color: (cand.tacticalDistance ?? cand.knnData?.distance ?? 1.5) < 1.5
                              ? '#059669'
                              : (cand.tacticalDistance ?? cand.knnData?.distance ?? 1.5) < 2.5
                              ? '#0284c7'
                              : '#d97706'
                          }}
                        >
                          {(cand.tacticalDistance ?? cand.knnData?.distance ?? 1.25).toFixed(2)}
                        </span>
                      </div>

                      <button
                        className={`btn-insert-court ${isCurrentlyOnCourt ? 'btn-inserted' : ''}`}
                        onClick={() => handleInsertToCourt(cand)}
                        disabled={isCurrentlyOnCourt}
                        title={cand.otherSlot ? `현재 ${cand.otherSlot} 출전 중인 선수입니다. 투입 후 기존 ${cand.otherSlot} 위치에 중복 주의 표시가 나타나며, 그 자리에 새로운 선수를 채울 수 있습니다.` : undefined}
                      >
                        {isCurrentlyOnCourt ? (
                          <>
                            <CheckCircle2 size={13} /> 코트 투입중
                          </>
                        ) : (
                          <>
                            <Zap size={13} /> 코트에 투입
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 헬퍼 함수: 타깃 선수의 팀 소속 선수들을 기반으로 5개 포지션 선발 라인업 자동 초기화
 */
function initializeLineup(targetPlayer, allPlayers) {
  if (!targetPlayer) return {};
  const team = targetPlayer.team;
  const teammates = allPlayers.filter((p) => p.team === team && p.id !== targetPlayer.id);

  const lineup = {
    PG: null,
    SG: null,
    SF: null,
    PF: null,
    C: null
  };

  // 1) 타깃 선수는 본인 포지션에 우선 배치
  lineup[targetPlayer.pos] = targetPlayer;

  // 2) 팀 내 동료 선수들로 나머지 포지션 우선 채우기
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  for (const pos of positions) {
    if (!lineup[pos]) {
      const match = teammates.find((p) => p.pos === pos);
      if (match) {
        lineup[pos] = match;
      }
    }
  }

  // 3) 만약 특정 포지션이 비어있으면 팀 내 출전 시간(MP) 높은 동료나 기본 선수로 채움
  const remaining = teammates.filter((p) => !Object.values(lineup).some((lp) => lp && lp.id === p.id));
  for (const pos of positions) {
    if (!lineup[pos] && remaining.length > 0) {
      lineup[pos] = remaining.shift();
    }
  }

  return lineup;
}
