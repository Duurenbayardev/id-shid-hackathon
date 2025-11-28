"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTopic() {
  const [user, setUser] = useState("");
  const [dailyScore, setDailyScore] = useState("");
  const [battleCoin, setBattleCoin] = useState(0);
  const [stats, setStats] = useState({
    hp: 0,
    earning: 0,
    maxCapacity: 0
  });

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("User is required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to create a user");
      }
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
        onChange={(e) => setBattleCoin(e.target.value)}
        value={battleCoin}
        className="border border-slate-500 px-8 py-2"
        type="number"
        placeholder="Battle Coin"
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

      <button
        type="submit"
        className="bg-green-600 font-bold text-white py-3 px-6 w-fit"
      >
        Add Topic
      </button>
    </form>
  );
}