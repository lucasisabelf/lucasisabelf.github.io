import { useCallback, useState } from 'react';
import type { ColumnData } from '../types/card';

const ACTIVITY_LOG_LIMIT = 20;
const MS_PER_DAY = 86400000;

export interface ActivityEntry {
  title: string;
  from: string;
  to: string;
}

interface ColumnEntry {
  column: string;
  since: number;
}

function safeJsonParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Rastreia em que coluna cada tarefa estava na última carga, pra derivar
 * "dias na coluna", tarefas novas e o feed de atividade (transições de
 * coluna). `activityTotalCount` é um contador monotônico à parte do log
 * truncado (ACTIVITY_LOG_LIMIT) — precisa ser assim porque o log truncado
 * para de crescer quando enche, o que quebraria a contagem de não-vistos.
 */
export function useActivityLog() {
  const [log, setLog] = useState<ActivityEntry[]>(() => safeJsonParse(localStorage.getItem('activityLog'), []));
  const [unseenCount, setUnseenCount] = useState(0);
  const [daysByTitle, setDaysByTitle] = useState<Map<string, number>>(new Map());
  const [newTitles, setNewTitles] = useState<Set<string>>(new Set());

  const track = useCallback((columns: ColumnData[]) => {
    const now = Date.now();
    const stored = safeJsonParse<Record<string, ColumnEntry>>(localStorage.getItem('columnEntryTimes'), {});
    const updated: Record<string, ColumnEntry> = {};
    const nextDaysByTitle = new Map<string, number>();
    const nextNewTitles = new Set<string>();
    const transitions: ActivityEntry[] = [];

    columns.forEach((col) => {
      col.cards.forEach((card) => {
        const entry = stored[card.title];
        if (!entry) nextNewTitles.add(card.title);
        else if (entry.column !== col.title) transitions.push({ title: card.title, from: entry.column, to: col.title });
        const since = entry && entry.column === col.title ? entry.since : now;
        updated[card.title] = { column: col.title, since };
        nextDaysByTitle.set(card.title, Math.floor((now - since) / MS_PER_DAY));
      });
    });

    localStorage.setItem('columnEntryTimes', JSON.stringify(updated));
    setDaysByTitle(nextDaysByTitle);
    setNewTitles(nextNewTitles);

    let totalCount = Number(localStorage.getItem('activityTotalCount')) || 0;
    if (transitions.length) {
      const newLog = [...transitions, ...safeJsonParse<ActivityEntry[]>(localStorage.getItem('activityLog'), [])].slice(
        0,
        ACTIVITY_LOG_LIMIT,
      );
      localStorage.setItem('activityLog', JSON.stringify(newLog));
      totalCount += transitions.length;
      localStorage.setItem('activityTotalCount', String(totalCount));
      setLog(newLog);
    }
    const lastSeen = Number(localStorage.getItem('activityLastSeenCount')) || 0;
    setUnseenCount(Math.max(totalCount - lastSeen, 0));
  }, []);

  const markSeen = useCallback(() => {
    const totalCount = localStorage.getItem('activityTotalCount') || '0';
    localStorage.setItem('activityLastSeenCount', totalCount);
    setUnseenCount(0);
  }, []);

  return { log, unseenCount, daysByTitle, newTitles, track, markSeen };
}
