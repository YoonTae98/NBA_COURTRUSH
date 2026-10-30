import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap
} from 'lucide-react';
import { PLAYERS } from '../data/mockPlayers';
import { NBA_TEAMS_2026 } from '../data/teamStandings2026';
import { buildMatchupPlan, getLeagueBenchmarks, summarizeTeam } from '../data/matchupStrategy';

const CURRENT_SEASON = 2026;

function TeamPicker({ team, teams, onChange, side, excludedTeamId }) {
  return (
    <label className="matchup-team-picker">
      <span className="matchup-picker-label">{side === 'A' ? 'HOME · 분석 팀' : 'AWAY · 상대 팀'}</span>
      <span className="matchup-picker-select-wrap">
        <img src={team.logoUrl} alt="" className="matchup-picker-logo" />
        <select value={team.id} onChange={(event) => onChange(event.target.value)} aria-label={`${side} 팀 선택`}>
          {teams.map((option) => (
            <option key={option.id} value={option.id} disabled={option.id === excludedTeamId}>
              {option.id} · {option.nameKo}
            </option>
          ))}
        </select>
      </span>
      <span className="matchup-team-record">{team.wins}승 {team.losses}패 · {team.conference === 'West' ? '서부' : '동부'}</span>
    </label>
  );
}

function CourtStrategyDiagram({ team, summary, style }) {
  const coordinates = style.key === 'spacing'
    ? { PG: [300, 128], SG: [102, 194], SF: [498, 194], PF: [150, 302], C: [450, 302] }
    : style.key === 'movement'
      ? { PG: [300, 145], SG: [118, 198], SF: [482, 198], PF: [210, 305], C: [390, 305] }
      : style.key === 'interior'
        ? { PG: [300, 140], SG: [105, 205], SF: [495, 205], PF: [222, 300], C: [378, 300] }
        : { PG: [300, 134], SG: [105, 198], SF: [495, 198], PF: [190, 300], C: [410, 300] };
  const route = style.key === 'spacing'
    ? 'M 300 142 C 300 205 300 245 300 336'
    : style.key === 'movement'
      ? 'M 300 154 C 255 178 205 190 118 198 M 118 206 C 145 255 176 278 210 305'
      : style.key === 'interior'
        ? 'M 300 150 C 330 210 352 252 378 300 M 378 308 C 360 327 334 340 300 350'
        : 'M 300 143 C 260 194 226 250 190 300 M 300 143 C 340 194 374 250 410 300';
  const markerId = `strategy-arrow-${team.id.toLowerCase()}-${style.key}`;

  return (
    <div className="strategy-court-wrap">
      <div className="strategy-court-heading">
        <div>
          <span className="strategy-court-eyebrow">추천 공격 배치 예시</span>
          <h3>{team.nameKo} · {style.label}</h3>
        </div>
        <span className="strategy-season-tag">{CURRENT_SEASON - 1}–{String(CURRENT_SEASON).slice(-2)}</span>
      </div>

      <svg className="strategy-court-svg" viewBox="0 0 600 410" role="img" aria-label={`${team.nameKo} ${style.label} 배치 예시`}>
        <defs>
          <linearGradient id="strategy-floor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4d8" />
            <stop offset="100%" stopColor="#f0d9a8" />
          </linearGradient>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={team.color || '#7657dc'} />
          </marker>
          {summary.lineup.map(({ position }) => (
            <clipPath key={position} id={`strategy-avatar-${team.id.toLowerCase()}-${position}`}>
              <circle
                cx={coordinates[position][0]}
                cy={coordinates[position][1]}
                r="25"
              />
            </clipPath>
          ))}
        </defs>

        <rect x="10" y="10" width="580" height="390" rx="22" fill="url(#strategy-floor)" stroke="#bd905c" strokeWidth="3" />
        <path d="M 42 400 L 42 238 C 42 84 558 84 558 238 L 558 400" fill="none" stroke="#9a7045" strokeWidth="3" opacity="0.7" />
        <rect x="220" y="210" width="160" height="190" fill="rgba(118,87,220,0.06)" stroke="#9a7045" strokeWidth="2.5" />
        <path d="M 220 210 A 80 80 0 0 1 380 210" fill="none" stroke="#9a7045" strokeWidth="2" />
        <path d="M 220 210 A 80 80 0 0 0 380 210" fill="none" stroke="#9a7045" strokeWidth="2" strokeDasharray="8 7" opacity="0.65" />
        <circle cx="300" cy="205" r="60" fill="none" stroke="#9a7045" strokeWidth="2" opacity="0.55" />
        <line x1="266" y1="373" x2="334" y2="373" stroke="#684a30" strokeWidth="5" strokeLinecap="round" />
        <circle cx="300" cy="365" r="10" fill="#f06a35" stroke="#fff6e4" strokeWidth="3" />

        <path d={route} fill="none" stroke={team.color || '#7657dc'} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" markerEnd={`url(#${markerId})`} opacity="0.82" />

        {summary.lineup.map(({ position, player }) => {
          const [x, y] = coordinates[position];
          const clipId = `strategy-avatar-${team.id.toLowerCase()}-${position}`;
          const shortName = player?.name?.split(' ').pop() || '공석';
          return (
            <g key={position}>
              <circle cx={x} cy={y} r="29" fill="#fff" stroke={team.color || '#7657dc'} strokeWidth="4" />
              {player?.imgUrl ? (
                <image href={player.imgUrl} x={x - 25} y={y - 25} width="50" height="50" preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} />
              ) : (
                <text x={x} y={y + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill="#606a7c">{position}</text>
              )}
              <rect x={x - 18} y={y - 47} width="36" height="20" rx="7" fill="#20263a" />
              <text x={x} y={y - 33} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{position}</text>
              <rect x={x - 52} y={y + 34} width="104" height="28" rx="9" fill="#252b3d" opacity="0.96" />
              <text x={x} y={y + 53} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{shortName}</text>
            </g>
          );
        })}
      </svg>

      <div className="strategy-diagram-caption">
        <span className="strategy-team-dot" style={{ background: team.color }} />
        <span>출전 시간 상위 로테이션에서 포지션별 선수를 골라 표시한 배치 예시</span>
      </div>
    </div>
  );
}

function StrategyCard({ title, icon: Icon, items, tone }) {
  return (
    <section className={`strategy-plan-card strategy-plan-${tone}`}>
      <div className="strategy-plan-heading">
        <span className="strategy-plan-icon"><Icon size={17} /></span>
        <h3>{title}</h3>
      </div>
      <div className="strategy-plan-list">
        {items.map((item, index) => (
          <article className="strategy-plan-item" key={`${item.title}-${index}`}>
            <div className="strategy-plan-item-top">
              <strong>{item.title}</strong>
              <span>{item.evidence}</span>
            </div>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function MatchupStrategyView({ onBack }) {
  const teams = useMemo(() => [...NBA_TEAMS_2026].sort((a, b) => a.overallRank - b.overallRank), []);
  const [teamAId, setTeamAId] = useState('OKC');
  const [teamBId, setTeamBId] = useState('BOS');
  const [activeSide, setActiveSide] = useState('A');
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiStrategy, setAiStrategy] = useState(null);
  const [aiStrategyKey, setAiStrategyKey] = useState('');

  const teamA = teams.find((team) => team.id === teamAId) || teams[0];
  const teamB = teams.find((team) => team.id === teamBId) || teams[1];
  const allSummaries = useMemo(() => teams.map((team) => summarizeTeam(team.id, PLAYERS)), [teams]);
  const benchmarks = useMemo(() => getLeagueBenchmarks(teams.map((team) => team.id), PLAYERS), [teams]);
  const summaryA = allSummaries.find((item) => item.teamId === teamAId) || summarizeTeam(teamAId, PLAYERS);
  const summaryB = allSummaries.find((item) => item.teamId === teamBId) || summarizeTeam(teamBId, PLAYERS);
  const selectedTeam = activeSide === 'A' ? teamA : teamB;
  const selectedSummary = activeSide === 'A' ? summaryA : summaryB;
  const opposingTeam = activeSide === 'A' ? teamB : teamA;
  const opposingSummary = activeSide === 'A' ? summaryB : summaryA;
  const plan = buildMatchupPlan(selectedSummary, opposingSummary, benchmarks);
  const currentMatchupKey = `${selectedTeam.id}:${opposingTeam.id}`;
  const hasCurrentAiStrategy = aiStrategyKey === currentMatchupKey && aiStrategy;
  const displayedPlan = hasCurrentAiStrategy
    ? { ...plan, offense: aiStrategy.offense, defense: aiStrategy.defense }
    : plan;
  const metricRows = [
    { key: 'threePointAttempts', label: '3점 시도', unit: '회', precision: 1 },
    { key: 'threePointPct', label: '3점 성공률', unit: '%', percent: true, precision: 1 },
    { key: 'assists', label: '어시스트', unit: '회', precision: 1 },
    { key: 'rebounds', label: '리바운드', unit: '개', precision: 1 }
  ];

  const updateTeamA = (nextId) => {
    if (nextId === teamBId) setTeamBId(teamAId);
    setTeamAId(nextId);
  };
  const updateTeamB = (nextId) => {
    if (nextId === teamAId) setTeamAId(teamBId);
    setTeamBId(nextId);
  };

  const requestAiStrategy = async () => {
    setAiStatus('loading');
    setAiStrategy(null);
    setAiStrategyKey('');
    const serializeSummary = (team, summary) => ({
      name: team.nameKo,
      code: team.id,
      sampleSize: summary.playerCount,
      stats: {
        pointsPerGame: Number(summary.stats.points.toFixed(1)),
        reboundsPerGame: Number(summary.stats.rebounds.toFixed(1)),
        assistsPerGame: Number(summary.stats.assists.toFixed(1)),
        blocksPerGame: Number(summary.stats.blocks.toFixed(1)),
        stealsPerGame: Number(summary.stats.steals.toFixed(1)),
        threePointAttemptsPerGame: Number(summary.stats.threePointAttempts.toFixed(1)),
        threePointPercentage: Number((summary.stats.threePointPct * 100).toFixed(1)),
        threePointAttemptShare: Number((summary.stats.threePointShare * 100).toFixed(1)),
      },
      scoringLeader: summary.topScorer
        ? { name: summary.topScorer.name, pointsPerGame: Number(summary.topScorer.stats?.pts || 0) }
        : null,
    });

    try {
      const response = await fetch('/api/matchup-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: '2025-26',
          team: serializeSummary(selectedTeam, selectedSummary),
          opponent: serializeSummary(opposingTeam, opposingSummary),
        }),
      });
      const result = await response.json();
      if (response.status === 503 && result.error === 'AI_NOT_CONFIGURED') {
        setAiStatus('not-configured');
        return;
      }
      if (!response.ok || !result.strategy) throw new Error(result.error || 'AI_REQUEST_FAILED');
      setAiStrategy(result.strategy);
      setAiStrategyKey(currentMatchupKey);
      setAiStatus('success');
    } catch {
      setAiStatus('error');
    }
  };

  return (
    <div className="view-container matchup-strategy-view">
      <button className="matchup-back-button" onClick={onBack}>
        <ArrowLeft size={17} /> 팀 순위로 돌아가기
      </button>

      <header className="matchup-hero">
        <span className="matchup-eyebrow"><Sparkles size={14} /> MATCHUP STRATEGY LAB</span>
        <h1>두 팀의 기록으로<br /><strong>경기 전략을 세워보세요.</strong></h1>
        <p>팀을 선택하면 현재 보유한 선수 박스스코어를 비교해 공격·수비 우선순위와 배치 예시를 만듭니다.</p>
      </header>

      <section className="matchup-select-panel" aria-label="분석할 팀 선택">
        <TeamPicker team={teamA} teams={teams} onChange={updateTeamA} side="A" excludedTeamId={teamBId} />
        <div className="matchup-vs-mark">VS</div>
        <TeamPicker team={teamB} teams={teams} onChange={updateTeamB} side="B" excludedTeamId={teamAId} />
      </section>

      <section className="matchup-data-note">
        <CircleAlert size={17} />
        <p><strong>현재 분석 범위:</strong> 로컬 2025–26 선수 박스스코어의 출전 시간 상위 8명 평균입니다. 슛 구역·Synergy 플레이 유형·실제 수비 매치업 자료는 이 저장소에 없어 추정치로 채우지 않았습니다.</p>
      </section>

      <section className="matchup-comparison-card">
        <div className="matchup-section-title">
          <div><span>TEAM PROFILE</span><h2>상위 로테이션 기록 비교</h2></div>
          <span className="matchup-avg-tag">선수별 경기당 평균</span>
        </div>
        <div className="matchup-metric-grid">
          {metricRows.map((metric) => {
            const valueA = summaryA.stats[metric.key] * (metric.percent ? 100 : 1);
            const valueB = summaryB.stats[metric.key] * (metric.percent ? 100 : 1);
            const maxValue = Math.max(valueA, valueB, 0.01);
            return (
              <div className="matchup-metric-row" key={metric.key}>
                <div className="matchup-metric-label"><span>{metric.label}</span><strong>{valueA.toFixed(metric.precision)}{metric.unit}</strong></div>
                <div className="matchup-metric-track" aria-label={`${teamA.id} ${valueA.toFixed(metric.precision)}, ${teamB.id} ${valueB.toFixed(metric.precision)}`}>
                  <span className="matchup-metric-fill matchup-fill-a" style={{ width: `${Math.max(3, (valueA / maxValue) * 50)}%`, backgroundColor: teamA.color }} />
                  <span className="matchup-metric-fill matchup-fill-b" style={{ width: `${Math.max(3, (valueB / maxValue) * 50)}%`, backgroundColor: teamB.color }} />
                </div>
                <div className="matchup-metric-label matchup-metric-b"><strong>{valueB.toFixed(metric.precision)}{metric.unit}</strong><span>{metric.label}</span></div>
              </div>
            );
          })}
        </div>
        <div className="matchup-legend">
          <span><i style={{ backgroundColor: teamA.color }} />{teamA.id} {summaryA.playerCount}명 표본</span>
          <span><i style={{ backgroundColor: teamB.color }} />{teamB.id} {summaryB.playerCount}명 표본</span>
        </div>
      </section>

      <div className="matchup-side-switch" role="tablist" aria-label="공격 전략 팀 선택">
        <button className={activeSide === 'A' ? 'active' : ''} onClick={() => setActiveSide('A')} role="tab" aria-selected={activeSide === 'A'}>
          <img src={teamA.logoUrl} alt="" /> {teamA.id} 공격 전략
        </button>
        <button className={activeSide === 'B' ? 'active' : ''} onClick={() => setActiveSide('B')} role="tab" aria-selected={activeSide === 'B'}>
          <img src={teamB.logoUrl} alt="" /> {teamB.id} 공격 전략
        </button>
      </div>

      <section className="matchup-strategy-grid">
        <div className="matchup-court-card">
          <CourtStrategyDiagram team={selectedTeam} summary={selectedSummary} style={plan.style} />
          <div className="matchup-lineup-caption"><Users size={15} /> 코트 선수는 팀 내 출전 시간 상위 로테이션에서 포지션별로 뽑았습니다. 공식 선발 명단은 아닙니다.</div>
        </div>
        <div className="matchup-plan-column">
          <div className="matchup-plan-summary">
            <div className="matchup-plan-summary-top">
              <span className="matchup-plan-label"><Zap size={14} /> {hasCurrentAiStrategy ? 'AI 전략 제안' : '기록 기반 전술 유형'}</span>
              <button className="matchup-ai-button" onClick={requestAiStrategy} disabled={aiStatus === 'loading'}>
                {aiStatus === 'loading' ? <LoaderCircle size={15} className="matchup-ai-spinner" /> : <Sparkles size={15} />}
                {aiStatus === 'loading' ? '전략 작성 중' : 'AI 전략 생성'}
              </button>
            </div>
            <h2>{selectedTeam.nameKo} <strong>{hasCurrentAiStrategy ? aiStrategy.headline : plan.style.label}</strong></h2>
            <p>{opposingTeam.nameKo}의 상위 로테이션 지표를 함께 비교해 우선순위를 정리했습니다.</p>
            {aiStatus === 'not-configured' && <p className="matchup-ai-status">AI API 키가 필요합니다. 프로젝트 루트의 <code>.env.local</code>에 <code>OPENAI_API_KEY</code>를 설정하고 개발 서버를 다시 시작하세요.</p>}
            {aiStatus === 'error' && <p className="matchup-ai-status matchup-ai-error">AI 요청에 실패했습니다. 현재는 기록 기반 추천을 표시하고 있습니다.</p>}
            {hasCurrentAiStrategy && <p className="matchup-ai-status">{aiStrategy.caution}</p>}
          </div>
          <StrategyCard title="공격 제안" icon={Target} items={displayedPlan.offense} tone="offense" />
          <StrategyCard title="수비 제안" icon={ShieldCheck} items={displayedPlan.defense} tone="defense" />
          <div className="matchup-key-players">
            <span className="matchup-key-players-title"><ChartNoAxesCombined size={15} /> 주요 기록 포인트</span>
            <div className="matchup-key-player-row">
              <span>{selectedTeam.id} 득점 상위</span>
              <strong>{selectedSummary.topScorer?.name || '선수 정보 없음'}</strong>
              <b>{selectedSummary.topScorer ? `${Number(selectedSummary.topScorer.stats?.pts || 0).toFixed(1)} PTS` : '—'}</b>
            </div>
            <div className="matchup-key-player-row">
              <span>{opposingTeam.id} 득점 상위</span>
              <strong>{opposingSummary.topScorer?.name || '선수 정보 없음'}</strong>
              <b>{opposingSummary.topScorer ? `${Number(opposingSummary.topScorer.stats?.pts || 0).toFixed(1)} PTS` : '—'}</b>
            </div>
          </div>
        </div>
      </section>

      <footer className="matchup-method-note">
        <ArrowRight size={15} />
        <span>전술 문구와 코트 배치는 박스스코어에서 도출한 제안입니다. 실제 플레이 유형, 슛 좌표, 경기별 수비 배정과는 다를 수 있습니다.</span>
      </footer>
    </div>
  );
}
