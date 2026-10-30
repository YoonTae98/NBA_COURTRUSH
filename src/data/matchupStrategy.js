const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

const numeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function getTeamRotation(teamId, players) {
  const latestSeason = Math.max(...players.map((player) => numeric(player.season)));
  const roster = players
    .filter((player) => player.team === teamId && numeric(player.season) === latestSeason)
    .sort((a, b) => numeric(b.mp) - numeric(a.mp));

  return roster.slice(0, 8);
}

export function getTacticalLineup(rotation) {
  const remaining = [...rotation];
  return POSITIONS.map((position) => {
    const matchingIndex = remaining.findIndex((player) =>
      String(player.pos || '').split(/[-/]/).includes(position)
    );
    const selectedIndex = matchingIndex >= 0 ? matchingIndex : (remaining.length ? 0 : -1);
    if (selectedIndex < 0) return { position, player: null };

    const [player] = remaining.splice(selectedIndex, 1);
    return { position, player };
  });
}

export function summarizeTeam(teamId, players) {
  const rotation = getTeamRotation(teamId, players);
  const average = (key) => rotation.length
    ? rotation.reduce((total, player) => total + numeric(player.stats?.[key]), 0) / rotation.length
    : 0;
  const threePointAttempts = rotation.reduce(
    (total, player) => total + numeric(player.stats?.x3pa),
    0
  ) / Math.max(rotation.length, 1);
  const threePointMakes = rotation.reduce(
    (total, player) => total + numeric(player.stats?.x3pa) * numeric(player.stats?.x3p_pct),
    0
  );
  const threePointShareWeight = rotation.reduce(
    (total, player) => total + numeric(player.features?.three_point_share),
    0
  );

  return {
    teamId,
    rotation,
    lineup: getTacticalLineup(rotation),
    playerCount: rotation.length,
    stats: {
      points: average('pts'),
      assists: average('ast'),
      rebounds: average('trb'),
      blocks: average('blk'),
      steals: average('stl'),
      threePointAttempts,
      threePointPct: threePointAttempts > 0 ? threePointMakes / (threePointAttempts * rotation.length) : 0,
      threePointShare: rotation.length ? threePointShareWeight / rotation.length : 0
    },
    topScorer: [...rotation].sort((a, b) => numeric(b.stats?.pts) - numeric(a.stats?.pts))[0] || null,
    topShooter: [...rotation].sort((a, b) => numeric(b.stats?.x3pa) - numeric(a.stats?.x3pa))[0] || null,
    topRimDefender: [...rotation].sort((a, b) => numeric(b.stats?.blk) - numeric(a.stats?.blk))[0] || null
  };
}

/**
 * 사용자가 코트 전술판에서 구성/보강한 5인 맞춤 라인업을 기반으로 팀 요약 데이터 생성
 */
export function summarizeCustomLineup(customLineupData) {
  if (!customLineupData || !customLineupData.lineup) return null;
  const { team, lineup, replacedSlots, tacticLayout } = customLineupData;

  const lineupPlayers = POSITIONS.map((pos) => lineup[pos]).filter(Boolean);
  const average = (key) => lineupPlayers.length
    ? lineupPlayers.reduce((total, player) => total + numeric(player.stats?.[key]), 0) / lineupPlayers.length
    : 0;

  const threePointAttempts = lineupPlayers.reduce(
    (total, player) => total + numeric(player.stats?.x3pa),
    0
  ) / Math.max(lineupPlayers.length, 1);

  const threePointMakes = lineupPlayers.reduce(
    (total, player) => total + numeric(player.stats?.x3pa) * numeric(player.stats?.x3p_pct),
    0
  );

  const threePointShareWeight = lineupPlayers.reduce(
    (total, player) => total + numeric(player.features?.three_point_share ?? player.stats?.three_point_share),
    0
  );

  const formattedLineup = POSITIONS.map((position) => ({
    position,
    player: lineup[position] || null,
    isReplaced: Boolean(replacedSlots?.[position])
  }));

  const replacedPlayersList = Object.entries(replacedSlots || {})
    .filter(([_, p]) => Boolean(p))
    .map(([pos, p]) => ({
      position: pos,
      name: p.name,
      clusterId: p.clusterId,
      originalTeam: p.team
    }));

  return {
    teamId: 'CUSTOM',
    baseTeamId: team?.id || 'CUSTOM',
    teamName: `${team?.nameKo || '팀'} (맞춤 5인 라인업)`,
    isCustomLineup: true,
    tacticLayout,
    rotation: lineupPlayers,
    lineup: formattedLineup,
    replacedPlayers: replacedPlayersList,
    playerCount: lineupPlayers.length,
    stats: {
      points: average('pts'),
      assists: average('ast'),
      rebounds: average('trb'),
      blocks: average('blk'),
      steals: average('stl'),
      threePointAttempts,
      threePointPct: threePointAttempts > 0 ? threePointMakes / (threePointAttempts * lineupPlayers.length) : 0,
      threePointShare: lineupPlayers.length ? threePointShareWeight / lineupPlayers.length : 0
    },
    topScorer: [...lineupPlayers].sort((a, b) => numeric(b.stats?.pts) - numeric(a.stats?.pts))[0] || null,
    topShooter: [...lineupPlayers].sort((a, b) => numeric(b.stats?.x3pa) - numeric(a.stats?.x3pa))[0] || null,
    topRimDefender: [...lineupPlayers].sort((a, b) => numeric(b.stats?.blk) - numeric(a.stats?.blk))[0] || null
  };
}

export function getLeagueBenchmarks(teamIds, players) {
  const summaries = teamIds.map((teamId) => summarizeTeam(teamId, players));
  const keys = ['assists', 'rebounds', 'blocks', 'steals', 'threePointAttempts', 'threePointPct', 'threePointShare'];
  return keys.reduce((result, key) => {
    const values = summaries.map((team) => team.stats[key]).filter(Number.isFinite).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    result[key] = values.length
      ? values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2
      : 0;
    return result;
  }, {});
}

export function inferTeamStyle(team, benchmarks) {
  if (team.tacticLayout?.key) {
    const key = team.tacticLayout.key;
    if (key === 'spacing') return { key: 'spacing', label: '외곽 스페이싱' };
    if (key === 'pick-and-roll') return { key: 'movement', label: '픽앤롤 & 볼 순환' };
    if (key === 'inside') return { key: 'interior', label: '골밑 공략' };
    if (key === 'balanced') return { key: 'balanced', label: '밸런스 공격' };
  }

  const { stats } = team;
  if (stats.threePointAttempts >= benchmarks.threePointAttempts
      && stats.threePointShare >= benchmarks.threePointShare) {
    return { key: 'spacing', label: '외곽 스페이싱' };
  }
  if (stats.assists >= benchmarks.assists) {
    return { key: 'movement', label: '볼 순환' };
  }
  if (stats.rebounds >= benchmarks.rebounds && stats.blocks >= benchmarks.blocks) {
    return { key: 'interior', label: '골밑 공략' };
  }
  return { key: 'balanced', label: '밸런스 공격' };
}

export function buildMatchupPlan(team, opponent, benchmarks) {
  const style = inferTeamStyle(team, benchmarks);
  const offense = [];
  const defense = [];

  if (team.isCustomLineup && team.replacedPlayers?.length > 0) {
    const repNames = team.replacedPlayers.map((p) => p.name).join(', ');
    offense.push({
      title: '머신러닝 맞춤 라인업 시너지 극대화',
      detail: `대체 영입된 선수(${repNames})를 주축으로 한 전술 배치입니다. 팀의 강점인 ${style.label}을 중심으로 상대 수비 약점을 공략합니다.`,
      evidence: '영입 대체 선수 프로필'
    });
  }

  if (style.key === 'spacing') {
    offense.push({
      title: '외곽 간격을 넓혀 돌파 공간 만들기',
      detail: `상위 로테이션의 3점 시도 평균은 ${team.stats.threePointAttempts.toFixed(1)}회, 시도 비중은 ${(team.stats.threePointShare * 100).toFixed(0)}%예요. 윙 슈터를 코너와 사이드에 두고 드라이브 경로를 확보하는 배치를 제안합니다.`,
      evidence: '3점 시도·시도 비중'
    });
  } else if (style.key === 'movement') {
    offense.push({
      title: '빠른 패스로 수비 로테이션 흔들기',
      detail: `상위 로테이션 어시스트 평균 ${team.stats.assists.toFixed(1)}회를 바탕으로 한 제안이에요. 볼 핸들러 주변에 패스 선택지를 만들고, 수비가 이동한 뒤 열린 슈터를 찾습니다.`,
      evidence: '어시스트'
    });
  } else if (style.key === 'interior') {
    offense.push({
      title: '골밑 압박과 공격 리바운드 활용',
      detail: `리바운드 평균 ${team.stats.rebounds.toFixed(1)}개와 블록 평균 ${team.stats.blocks.toFixed(1)}개를 바탕으로 한 제안이에요. 페인트존 진입과 슛 이후 세컨드 찬스에 무게를 둡니다.`,
      evidence: '리바운드·블록'
    });
  } else {
    offense.push({
      title: '상대 수비 반응에 맞춰 균형 있게 전개',
      detail: '특정 지표 하나가 두드러지지 않아, 볼 운반·윙 간격·골밑 지원을 고르게 둔 배치를 제안합니다.',
      evidence: '상위 로테이션 평균'
    });
  }

  if (team.stats.assists >= benchmarks.assists && style.key !== 'movement') {
    offense.push({
      title: '볼 없는 선수의 움직임 더하기',
      detail: `어시스트 평균 ${team.stats.assists.toFixed(1)}회를 살려 2차 패스와 컷인을 활용합니다. 실제 플레이 유형 데이터는 반영되지 않은 기록 기반 추정입니다.`,
      evidence: '어시스트'
    });
  }
  if (team.stats.rebounds >= benchmarks.rebounds && style.key !== 'interior') {
    offense.push({
      title: '슛 이후 리바운드 우위 노리기',
      detail: `리바운드 평균 ${team.stats.rebounds.toFixed(1)}개를 바탕으로, 외곽 슛을 시도할 때 빅맨의 리바운드 가담을 제안합니다.`,
      evidence: '리바운드'
    });
  }

  if (opponent.stats.threePointAttempts >= benchmarks.threePointAttempts) {
    defense.push({
      title: '외곽 슈터에게 빠르게 복귀',
      detail: `상대 상위 로테이션의 3점 시도 평균은 ${opponent.stats.threePointAttempts.toFixed(1)}회예요. 드라이브 도움수비 뒤 코너와 윙으로 돌아가는 수비를 우선합니다.`,
      evidence: '상대 3점 시도'
    });
  }
  if (opponent.stats.assists >= benchmarks.assists) {
    defense.push({
      title: '첫 패스 경로 압박',
      detail: `상대 어시스트 평균 ${opponent.stats.assists.toFixed(1)}회를 고려해 볼 운반과 첫 패스 선택지를 압박하고, 쉬운 2차 패스를 줄입니다.`,
      evidence: '상대 어시스트'
    });
  }
  if (opponent.stats.rebounds >= benchmarks.rebounds || opponent.stats.blocks >= benchmarks.blocks) {
    defense.push({
      title: '박스아웃과 골밑 도움수비 준비',
      detail: `상대의 리바운드·블록 기록이 리그 중간값 이상이에요. 슛 이후 박스아웃을 먼저 확보하고, 돌파에는 2선 도움을 준비합니다.`,
      evidence: '상대 리바운드·블록'
    });
  }
  if (!defense.length) {
    defense.push({
      title: '수비 간격 유지하고 쉬운 득점 차단',
      detail: '뚜렷한 단일 공격 지표가 확인되지 않아, 페인트존과 외곽을 함께 지키는 기본 수비를 제안합니다.',
      evidence: '상대 상위 로테이션 평균'
    });
  }

  return { style, offense, defense };
}
