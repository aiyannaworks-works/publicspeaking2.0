"use client";
import { useEffect, useState } from 'react';
import { UserData } from '@/lib/types';
import { addFriend, searchUsers, getWeeklyLeaderboard } from '@/lib/auth-context';
import { Btn } from './ui';

export default function Social({ user, userId = null, onFriendsChanged = () => {} }: { user: UserData; userId?: string | null; onFriendsChanged?: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [league, setLeague] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [leagueError, setLeagueError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    getWeeklyLeaderboard().then(({ leaderboard, error }) => {
      if (!alive) return;
      if (error) setLeagueError('The weekly league could not load. Please try again later.');
      else setLeague(leaderboard || []);
    });
    return () => { alive = false; };
  }, [user.xp]);
  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) { setMessage('Sign in from the menu to find and add friends.'); return; }
    const text = query.trim(); if (text.length < 2) { setMessage('Enter at least two characters.'); return; }
    if (!/^[a-zA-Z0-9_.-]+$/.test(text)) { setMessage('Search using a username: letters, numbers, dots, dashes, or underscores.'); return; }
    setBusy(true); setResults([]);
    try {
      const { results: matches, error } = await searchUsers(text, userId);
      setResults(matches || []); setMessage(error ? 'Search is unavailable. Please try again.' : matches?.length ? '' : 'No matching usernames found.');
    } finally { setBusy(false); }
  };
  const add = async (username: string) => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      const { error } = await addFriend(userId, username);
      setMessage(error ? 'Could not add this friend. They may already be in your list.' : `${username} added to your friends.`);
      if (!error) onFriendsChanged();
    } finally { setBusy(false); }
  };
  return <div>
    <h1>Weekly League</h1><p>Ranked by this week's earned XP.</p>
    {leagueError && <p role="alert">{leagueError}</p>}
    {!leagueError && !league.length && <p>No weekly scores yet. Complete a signed-in session to join.</p>}
    {league.map((entry, index) => <div className="card social-row" key={entry.profiles?.id || index} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
      <span>#{index + 1} {entry.profiles?.username || 'Speaker'} {entry.profiles?.id === userId ? '(You)' : ''}</span><strong>{entry.xp} XP</strong>
    </div>)}
    <h2 style={{ marginTop: 32 }}>Your friends</h2>
    {user.friends.length ? user.friends.map(friend => <p key={friend.id}>{friend.name} • Level {friend.level}</p>) : <p>No friends added yet.</p>}
    <h2 style={{ marginTop: 32 }}>Add friends</h2>
    <form onSubmit={search} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label htmlFor="friend-search">Search by username</label>
      <input id="friend-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter a username" />
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Search'}</button>
    </form>
    {message && <p role="status" style={{ marginTop: 16 }}>{message}</p>}
    {results.map(person => <div className="card" key={person.id} style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
      <span>{person.username} • Level {person.level}</span>
      <Btn disabled={busy || user.friends.some(f => f.id === person.id)} onClick={() => void add(person.username)}>{user.friends.some(f => f.id === person.id) ? 'Added' : 'Add friend'}</Btn>
    </div>)}
  </div>;
}
