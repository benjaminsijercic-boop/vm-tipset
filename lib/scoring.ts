export type GroupPick = { team: string; position: number };
export type BonusPick = Record<string, string>;

export function scoreGroup(picks: GroupPick[], actual: GroupPick[]) {
  return picks.reduce((sum, pick) => {
    const hit = actual.find(a => a.team === pick.team);
    if (!hit) return sum;
    return sum + (hit.position === pick.position ? 5 : 3);
  }, 0);
}

export function scoreKnockout(picks: string[], actual: string[], points: number) {
  return picks.filter(team => actual.includes(team)).length * points;
}

export function scoreBonus(picks: BonusPick, actual: BonusPick) {
  return Object.entries(actual).reduce((sum, [key, value]) => {
    return sum + (picks[key]?.trim().toLowerCase() === value.trim().toLowerCase() ? 5 : 0);
  }, 0);
}
