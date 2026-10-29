import React, { useState, useMemo } from 'react';
import { NBA_TEAMS_2026 } from '../data/teamStandings2026';
import {
  Search,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronRight,
  Users,
  Trophy,
  Globe2,
  Compass,
  Flame
} from 'lucide-react';

/**
 * 2026 시즌 팀 순위 및 선수 사진 갤러리 컴포넌트
 * 1. 26시즌 팀 순위표(전체/동부/서부)를 먼저 확인하고 팀을 선택할 수 있습니다.
 * 2. 선택한 팀의 선수들이 공식 NBA 헤드샷 이미지로 나열됩니다.
 * 3. 선수를 클릭하면 즉시 스카우팅 엔진의 분석 기준 선수(타깃)로 연동됩니다.
 */
export default function PlayerRosterGallery({
  players,
  selectedPlayerId,
  onSelectPlayer,
  clusters
}) {
  // 팀 스탠딩 컨퍼런스 탭: 'OVERALL' (전체 1~30위), 'WEST' (서부 1~15위), 'EAST' (동부 1~15위)
  const [conferenceTab, setConferenceTab] = useState('OVERALL');
  // 선택된 팀 (기본값: Stephen Curry의 소속팀 'GSW' 또는 'ALL')
  const [selectedTeam, setSelectedTeam] = useState('GSW');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedPos, setSelectedPos] = useState('ALL');
  const [gallerySearch, setGallerySearch] = useState('');

  // 1. 컨퍼런스 탭에 따른 정렬된 팀 순위 목록 계산
  const sortedTeams = useMemo(() => {
    if (conferenceTab === 'WEST') {
      return NBA_TEAMS_2026.filter((t) => t.conference === 'West').sort((a, b) => a.confRank - b.confRank);
    }
    if (conferenceTab === 'EAST') {
      return NBA_TEAMS_2026.filter((t) => t.conference === 'East').sort((a, b) => a.confRank - b.confRank);
    }
    // 전체 리그 순위 (승률 기준 1위~30위)
    return [...NBA_TEAMS_2026].sort((a, b) => a.overallRank - b.overallRank);
  }, [conferenceTab]);

  // 포지션 목록
  const positions = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'];

  // 현재 선택된 팀의 스탠딩 정보
  const activeTeamInfo = useMemo(() => {
    return NBA_TEAMS_2026.find((t) => t.id === selectedTeam) || null;
  }, [selectedTeam]);

  // 2. 필터링된 선수 목록 (선택된 팀, 군집, 포지션, 검색어)
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      // 1) 팀 필터
      if (selectedTeam !== 'ALL' && p.team !== selectedTeam) return false;
      // 2) 군집 필터
      if (selectedCluster !== 'ALL' && p.clusterId !== Number(selectedCluster)) return false;
      // 3) 포지션 필터
      if (selectedPos !== 'ALL' && p.pos !== selectedPos) return false;
      // 4) 텍스트 검색
      if (gallerySearch.trim()) {
        const q = gallerySearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.pos.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [players, selectedTeam, selectedCluster, selectedPos, gallerySearch]);

  // 현재 타깃 선수 객체
  const targetPlayer = useMemo(() => {
    return players.find((p) => p.id === selectedPlayerId) || null;
  }, [players, selectedPlayerId]);

  return (
    <div className="roster-gallery-card">
      {/* 갤러리 메인 헤더 */}
      <div className="roster-gallery-header">
        <div className="roster-title-group">
          <div className="roster-badge-live">
            <span className="live-dot" />
            <span>2025-26 NBA Official Standings & Headshots</span>
          </div>
          <h2 className="roster-main-title">
            <Trophy size={22} className="roster-icon trophy-color" />
            2026 시즌 NBA 팀 순위 & 선수 로스터
          </h2>
          <p className="roster-subtitle">
            2026 시즌 공식 팀 순위를 확인하고 팀을 선택하면, 해당 팀 소속 선수들의 실제 프로필 사진을 통해 스카우팅 기준 선수를 지정할 수 있습니다.
          </p>
        </div>

        {/* 현재 선정된 분석 대상 선수 미니 배지 */}
        {targetPlayer && (
          <div className="active-target-pill-top">
            <span className="target-label">현재 스카우팅 기준점:</span>
            <span className="target-val">
              {targetPlayer.name} ({targetPlayer.team} · {targetPlayer.pos})
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          STEP 1: 2026 시즌 팀 순위 (선수 목록 이전에 먼저 표시)
          ========================================================= */}
      <div className="team-standings-section">
        <div className="standings-header-row">
          <div className="standings-title-wrap">
            <span className="step-tag">STEP 1</span>
            <h3 className="sub-section-title">2026 시즌 NBA 팀 순위표</h3>
            <span className="standings-sub">원하는 팀을 클릭하면 아래 선수 목록이 해당 팀으로 즉시 전환됩니다.</span>
          </div>

          {/* 컨퍼런스 탭 전환 버튼 & 전체 보기 */}
          <div className="conference-tabs">
            <button
              className={`conf-tab-btn ${conferenceTab === 'OVERALL' ? 'active' : ''}`}
              onClick={() => setConferenceTab('OVERALL')}
            >
              <Globe2 size={14} /> 전체 리그 순위 (1~30위)
            </button>
            <button
              className={`conf-tab-btn ${conferenceTab === 'WEST' ? 'active' : ''}`}
              onClick={() => setConferenceTab('WEST')}
            >
              <Compass size={14} /> 서부 컨퍼런스
            </button>
            <button
              className={`conf-tab-btn ${conferenceTab === 'EAST' ? 'active' : ''}`}
              onClick={() => setConferenceTab('EAST')}
            >
              <Flame size={14} /> 동부 컨퍼런스
            </button>
            <button
              className={`conf-tab-btn all-teams-btn ${selectedTeam === 'ALL' ? 'active-all' : ''}`}
              onClick={() => setSelectedTeam('ALL')}
              title="30개 구단 전체 선수 보기"
            >
              전체 구단 보기 (ALL)
            </button>
          </div>
        </div>

        {/* 팀 순위 가로 스크롤 카드 리스트 */}
        <div className="team-cards-scroll">
          {sortedTeams.map((team) => {
            const isTeamSelected = selectedTeam === team.id;
            const displayRank = conferenceTab === 'OVERALL' ? team.overallRank : team.confRank;
            const isTop3 = displayRank <= 3;

            return (
              <div
                key={team.id}
                className={`team-standing-card ${isTeamSelected ? 'is-team-active' : ''}`}
                style={{
                  borderTop: `3.5px solid ${team.color}`
                }}
                onClick={() => setSelectedTeam(team.id)}
                title={`${team.nameKo} (${team.name}) 선수 목록 보기`}
              >
                <div className="team-card-top">
                  <span className={`rank-badge ${isTop3 ? `rank-${displayRank}` : ''}`}>
                    #{displayRank}
                  </span>
                  <span className="team-conf-tag">{team.conference}</span>
                </div>

                <div className="team-identity-brand">
                  <div className="team-logo-wrap">
                    <img
                      src={team.logoUrl}
                      alt={team.id}
                      className="team-logo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="team-code-badge" style={{ color: team.color }}>
                    {team.id}
                  </span>
                </div>

                <div className="team-record-grid">
                  <div className="record-col">
                    <span className="rec-label">승-패</span>
                    <span className="rec-val">{team.wins}-{team.losses}</span>
                  </div>
                  <div className="record-col">
                    <span className="rec-label">승률</span>
                    <span className="rec-val">{(team.pct * 100).toFixed(1)}%</span>
                  </div>
                  <div className="record-col">
                    <span className="rec-label">차이</span>
                    <span className="rec-val">{team.gb}</span>
                  </div>
                </div>

                <div className="team-star-bar">
                  <span className="star-icon-small">⭐</span>
                  <span className="star-player-name">{team.starPlayer}</span>
                </div>

                {isTeamSelected && (
                  <div className="selected-team-indicator">
                    <CheckCircle2 size={12} /> 선택된 구단
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          STEP 2: 선택된 팀의 선수 사진 로스터 목록
          ========================================================= */}
      <div className="player-roster-section">
        <div className="roster-filter-header">
          <div className="roster-active-team-title">
            <span className="step-tag">STEP 2</span>
            <div className="team-title-wrap">
              <h3 className="sub-section-title">
                {activeTeamInfo ? (
                  <div className="active-team-title-row">
                    <img
                      src={activeTeamInfo.logoUrl}
                      alt={activeTeamInfo.id}
                      className="active-team-logo-mini"
                    />
                    <span style={{ color: activeTeamInfo.color }}>{activeTeamInfo.id}</span>
                    <span>선수 로스터 ({activeTeamInfo.overallRank}위 · {activeTeamInfo.wins}승 {activeTeamInfo.losses}패)</span>
                  </div>
                ) : (
                  'NBA 30개 전 구단 선수 로스터'
                )}
              </h3>
              <span className="standings-sub">
                선수 사진을 클릭하면 즉시 아래 머신러닝 군집 맵과 최적 대체 영입 추천이 가동됩니다.
              </span>
            </div>
          </div>

          {/* 선수 필터 (검색, 포지션, 머신러닝 군집) */}
          <div className="roster-sub-filters">
            <div className="gallery-search-wrap">
              <Search size={15} className="search-icon-inside" />
              <input
                type="text"
                placeholder="선수명, 포지션 빠른 검색..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="gallery-search-input"
              />
              {gallerySearch && (
                <button className="btn-clear-search" onClick={() => setGallerySearch('')}>
                  ✕
                </button>
              )}
            </div>

            {/* 포지션 필터 */}
            <div className="filter-pill-group">
              <span className="filter-group-label">포지션:</span>
              {positions.map((pos) => (
                <button
                  key={pos}
                  className={`pill-btn ${selectedPos === pos ? 'active' : ''}`}
                  onClick={() => setSelectedPos(pos)}
                >
                  {pos === 'ALL' ? '전체' : pos}
                </button>
              ))}
            </div>

            {/* 머신러닝 군집 필터 */}
            <div className="filter-pill-group">
              <span className="filter-group-label">군집:</span>
              <button
                className={`pill-btn ${selectedCluster === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCluster('ALL')}
              >
                전체
              </button>
              {clusters.map((c) => (
                <button
                  key={c.id}
                  className={`pill-btn ${selectedCluster === String(c.id) ? 'active' : ''}`}
                  style={{
                    borderColor: selectedCluster === String(c.id) ? c.color : undefined,
                    color: selectedCluster === String(c.id) ? c.color : undefined
                  }}
                  onClick={() => setSelectedCluster(String(c.id))}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 탐색 현황 카운트 */}
        <div className="gallery-meta-bar">
          <span className="meta-count">
            로스터 선수: <strong>{filteredPlayers.length}</strong>명 표시 중
          </span>
          {activeTeamInfo && (
            <button
              className="btn-show-all-inline"
              onClick={() => setSelectedTeam('ALL')}
            >
              전체 팀 보기로 변경
            </button>
          )}
        </div>

        {/* 선수 사진 그리드 */}
        <div className="roster-grid">
          {filteredPlayers.slice(0, 48).map((player) => {
            const isSelected = player.id === selectedPlayerId;
            const cluster = clusters[player.clusterId];

            return (
              <div
                key={player.id}
                className={`roster-player-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectPlayer(player.id)}
                style={{
                  borderColor: isSelected ? '#0284c7' : undefined
                }}
                title={`${player.name} (${player.team} · ${player.pos}) 선택`}
              >
                {isSelected && (
                  <div className="selected-ribbon">
                    <CheckCircle2 size={13} />
                    <span>분석 대상</span>
                  </div>
                )}

                <div className="photo-container">
                  <img
                    src={player.imgUrl || 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png'}
                    alt={player.name}
                    className="player-headshot"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn.nba.com/headshots/nba/latest/260x190/fallback.png';
                    }}
                  />
                  <span
                    className="cluster-tag-dot"
                    style={{ backgroundColor: cluster.color }}
                    title={cluster.name}
                  />
                </div>

                <div className="player-summary-info">
                  <div className="player-name-row">
                    <span className="player-grid-name">{player.name}</span>
                  </div>
                  <div className="player-grid-meta">
                    <span className="meta-team-badge">{player.team}</span>
                    <span className="meta-pos-badge">{player.pos}</span>
                    <span className="meta-pts-badge">{player.stats.pts}P</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="no-players-in-filter">
            <p>선택하신 조건(팀/포지션/군집)에 부합하는 선수가 없습니다.</p>
            <button className="btn-reset-filters" onClick={() => { setSelectedPos('ALL'); setSelectedCluster('ALL'); setGallerySearch(''); }}>
              필터 초기화
            </button>
          </div>
        )}

        {filteredPlayers.length > 48 && (
          <div className="gallery-more-footer">
            <span>
              총 {filteredPlayers.length}명 중 상위 48명의 선수를 표시하고 있습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
