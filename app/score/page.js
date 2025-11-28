// In your React component
"use client"
import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/score');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Daily Score</th>
          </tr>
        </thead>
        <tbody className='text-white'>
          {users&&users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.user}</td>
              <td>{user.dailyScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}