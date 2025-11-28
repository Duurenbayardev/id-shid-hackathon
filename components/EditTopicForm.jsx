"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditTopicForm({
  id: initialId,
  user: initialUser,
  zoos: initialZoos,
  ymbuu: initialYmbuu,
  dailyScore: initialDailyScore,
  stats: initialStats
}) {
  const [id, setId] = useState(initialId);
  const [user, setUser] = useState(initialUser);
  const [dailyScore, setDailyScore] = useState(initialDailyScore);
  const [zoos, setZoos] = useState(initialZoos);
  const [ymbuu, setYmbuu] = useState(initialYmbuu);
  const [stats, setStats] = useState(initialStats);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Provide a proper payload object
      
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          // "Authorization": `${token}`,
        },
        body: JSON.stringify({
          id,
          user,
          dailyScore,
          zoos: Number(zoos),
          ymbuu: Number(ymbuu),
          stats: {
            hp: Number(stats.hp),
            earning: Number(stats.earning),
            maxCapacity: Number(stats.maxCapacity)
          }
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update topic");
      }

      router.refresh();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatsChange = (field, value) => {
    setStats(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        onChange={(e) => setUser(e.target.value)}
        value={user}
        className="border border-slate-500 px-8 py-2"
        type="text"
        placeholder="User"
      />

      <input
        onChange={(e) => setDailyScore(e.target.value)}
        value={dailyScore}
        className="border border-slate-500 px-8 py-2"
        type="number"
        placeholder="Daily Score"
      />

      <input
        onChange={(e) => setZoos(e.target.value)}
        value={zoos}
        className="border border-slate-500 px-8 py-2"
        type="number"
        placeholder="Zoos"
      />
      
      <input
        onChange={(e) => setYmbuu(e.target.value)}
        value={ymbuu}
        className="border border-slate-500 px-8 py-2"
        type="number"
        placeholder="Ymbuu"
      />

      <div className="border border-slate-500 p-4 rounded">
        <h3 className="font-bold mb-2">Stats</h3>
        <div className="flex flex-col gap-2">
          <input
            onChange={(e) => handleStatsChange('hp', e.target.value)}
            value={stats.hp}
            className="border border-slate-300 px-4 py-2"
            type="number"
            placeholder="HP"
          />
          <input
            onChange={(e) => handleStatsChange('earning', e.target.value)}
            value={stats.earning}
            className="border border-slate-300 px-4 py-2"
            type="number"
            placeholder="Earning"
          />
          <input
            onChange={(e) => handleStatsChange('maxCapacity', e.target.value)}
            value={stats.maxCapacity}
            className="border border-slate-300 px-4 py-2"
            type="number"
            placeholder="Max Capacity"
          />
        </div>
      </div>

      <button className="bg-green-600 font-bold text-white py-3 px-6 w-fit">
        Update Topic
      </button>
    </form>
  );
}