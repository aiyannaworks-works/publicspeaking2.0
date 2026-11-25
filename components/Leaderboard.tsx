"use client";
import { useEffect, useState } from 'react';
import { UserData } from '@/lib/types';
import { getWeeklyLeaderboard } from '@/lib/auth-context';
export default function Leaderboard({ user }: { user: UserData }) {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState('Loading weekly rankings…');
  useEffect(() => {
    let alive = true;
    getWeeklyLeaderboard().then(({ leaderboard, error }) => {
      if (!alive) return;
      setRows(leaderboard || []);
      setMessage(error ? 'Weekly rankings are unavailable right now.' : !leaderboard?.length ? 'Complete a signed-in session to join the weekly league.' : '');
    });
    return () => { alive = false; };
  }, [user.xp]);
  return <section className="card"><h3>Weekly leaderboard</h3>
    {message && <p role="status">{message}</p>}
    {rows.slice(0, 5).map((row, i) => <div key={row.profiles?.id || i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, padding: '12px 0' }}><span>#{i + 1} {row.profiles?.username || 'Speaker'}</span><strong>{row.xp} XP</strong></div>)}
  </section>;
}
