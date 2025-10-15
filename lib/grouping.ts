export function assignGroups(sortedTickers: string[]) {
  const g1Set = new Set(['BTC-USD', 'ETH-USD']);
  const groupMap = new Map<string, string>();
  sortedTickers.forEach((t, i) => {
    if (g1Set.has(t)) groupMap.set(t, 'Group 1');
    else {
      const rank = i + 1;
      if (rank >= 3 && rank <= 10) groupMap.set(t, 'Group 2');
      else if (rank >= 11 && rank <= 30) groupMap.set(t, 'Group 3');
      else groupMap.set(t, 'Group 4');
    }
  });
  return groupMap;
}

export function getGroupSubtitle(group: string) {
  if (group === 'Group 1') return 'BTC-USD and ETH-USD';
  if (group === 'Group 2') return 'Volume rank 3–10';
  if (group === 'Group 3') return 'Volume rank 11–30';
  return 'Volume rank 31+';
}

