import React, { useState, useMemo } from 'react';
import { NBA_TEAMS_2026 } from '../data/teamStandings2026';
import basketballHero from '../assets/basketball-hero.png';
import { Globe2, Compass, Flame, ArrowRight, Sparkles } from 'lucide-react';

/**
 * 1단계: 2026 시즌 NBA 팀 순위 전용 뷰 (초기 첫 화면)
 * 30개 NBA 구단의 공식 순위, 로고, 3자리 알파벳 약칭을 크게 표시합니다.
 * 팀을 클릭하면 2단계(선수 로스터 뷰)로 전환됩니다.
 */
export default function TeamListView({ onSelectTeam, onOpenMatchup }) {
  const [conferenceTab, setConferenceTab] = useState('OVERALL'); // 'OVERALL' | 'WEST' | 'EAST'
  const [searchTerm, setSearchTerm] = useState('');

  // 컨퍼런스 탭 및 검색어 필터링
  const sortedTeams = useMemo(() => {
    let list = [...NBA_TEAMS_2026];
    if (conferenceTab === 'WEST') {
      list = list.filter((t) => t.conference === 'West').sort((a, b) => a.confRank - b.confRank);
    } else if (conferenceTab === 'EAST') {
      list = list.filter((t) => t.conference === 'East').sort((a, b) => a.confRank - b.confRank);
    } else {
      list.sort((a, b) => a.overallRank - b.overallRank);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.starPlayer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conferenceTab, searchTerm]);

  return (
    <div className="view-container team-list-view">
      {/* 히어로 헤더 섹션 */}
      <section className="team-hero-header">
        <div className="step-flow-badge">
          <span className="step-flow-num active">STEP 1</span>
          <span className="step-flow-text">대체 선수를 탐색할 구단(Team)을 선택하세요</span>
        </div>

        <h1 className="team-hero-title">
          <span className="team-hero-season">2025–26 NBA</span>
          <strong>팀 순위 한눈에.</strong>
        </h1>
        <p className="team-hero-desc">
          30개 구단의 순위를 살펴보고, 팀을 선택해 선수 로스터와 대체 선수 추천까지 이어서 확인하세요.
        </p>

        <div className="league-snapshot" aria-label="리그 및 분석 요약">
          <div className="snapshot-item">
            <span className="snapshot-value">30</span>
            <span className="snapshot-label">NBA 구단</span>
          </div>
          <div className="snapshot-item">
            <span className="snapshot-value">02</span>
            <span className="snapshot-label">컨퍼런스</span>
          </div>
          <div className="snapshot-item snapshot-method">
            <span className="snapshot-value">K-means <i>→</i> KNN</span>
            <span className="snapshot-label">군집 기반 대체 선수 탐색</span>
          </div>
        </div>

        <button className="matchup-entry-button" onClick={onOpenMatchup}>
          <span className="matchup-entry-icon"><Sparkles size={15} /></span>
          <span className="matchup-entry-copy">
            <strong>두 팀 경기 전략 분석</strong>
            <small>공격·수비 기록 비교와 코트 배치 제안</small>
          </span>
          <ArrowRight size={17} />
        </button>

        <div className="hero-art" aria-hidden="true">
          <img className="hero-action-photo" src={basketballHero} alt="" />
        </div>
      </section>

      {/* 탭 및 검색 컨트롤 */}
      <div className="team-filter-controls">
          <div className="conf-tab-group">
            <button
              className={`conf-pill-btn ${conferenceTab === 'OVERALL' ? 'active' : ''}`}
              onClick={() => setConferenceTab('OVERALL')}
            >
              <Globe2 size={16} /> 전체 리그 순위 (1~30위)
            </button>
            <button
              className={`conf-pill-btn ${conferenceTab === 'WEST' ? 'active' : ''}`}
              onClick={() => setConferenceTab('WEST')}
            >
              <Compass size={16} /> 서부 컨퍼런스 (1~15위)
            </button>
            <button
              className={`conf-pill-btn ${conferenceTab === 'EAST' ? 'active' : ''}`}
              onClick={() => setConferenceTab('EAST')}
            >
              <Flame size={16} /> 동부 컨퍼런스 (1~15위)
            </button>
          </div>

          <div className="team-quick-search">
            <input
              type="text"
              placeholder="팀 코드(GSW) 또는 선수명 검색"
              title="팀 코드(GSW, LAL 등) 또는 스타 선수 이름으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="team-search-input"
            />
          </div>
      </div>

      {/* 30개 구단 대형 그리드 */}
      <section className="teams-grid-container">
        <div className="teams-large-grid">
          {sortedTeams.map((team) => {
            const displayRank = conferenceTab === 'OVERALL' ? team.overallRank : team.confRank;
            const isTop3 = displayRank <= 3;

            return (
              <div
                key={team.id}
                className="team-spotlight-card"
                style={{
                  borderTop: `4px solid ${team.color}`
                }}
                onClick={() => onSelectTeam(team.id)}
              >
                {/* 상단 순위 및 컨퍼런스 */}
                <div className="card-rank-row">
                  <span className={`large-rank-badge ${isTop3 ? `rank-${displayRank}` : ''}`}>
                    #{displayRank}
                  </span>
                  <span className="conf-badge">{team.conference}</span>
                </div>

                {/* 중앙: 공식 로고 + 3자리 알파벳 약칭만 큼직하게 표시 */}
                <div className="team-brand-center">
                  <div className="team-logo-circle">
                    <img
                      src={team.logoUrl}
                      alt={team.id}
                      className="team-logo-big"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h2 className="team-3code" style={{ color: team.color }}>
                    {team.id}
                  </h2>
                </div>

                {/* 하단: 승-패, 승률, 경기차 */}
                <div className="team-stats-strip">
                  <div className="stat-item">
                    <span className="s-label">승-패</span>
                    <span className="s-val">{team.wins}-{team.losses}</span>
                  </div>
                  <div className="stat-item">
                    <span className="s-label">승률</span>
                    <span className="s-val">{(team.pct * 100).toFixed(1)}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="s-label">GB</span>
                    <span className="s-val">{team.gb}</span>
                  </div>
                </div>

                {/* 대표 스타 선수 */}
                <div className="team-star-pill">
                  <span className="star-icon">⭐</span>
                  <span className="star-text">{team.starPlayer}</span>
                </div>

                {/* 호버 액션 힌트 */}
                <div className="card-hover-prompt">
                  <span>로스터 보기</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
