import { useState, useEffect } from "react";

export function useUserStatus() {
  const [headcounts, setHeadcounts] = useState({ safe: 0, needHelp: 0, total: 0, allClear: false });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setHeadcounts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkIn = async (room: string, status: "safe" | "need_help") => {
    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, status }),
      });
      fetchStats();
    } catch (error) {
      console.error("Error during check-in", error);
    }
  };

  const broadcastAllClear = async (allClear: boolean) => {
    try {
      await fetch("/api/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allClear }),
      });
      fetchStats();
    } catch (error) {
      console.error("Error broadcasting all clear", error);
    }
  };

  return { headcounts, loading, checkIn, broadcastAllClear };
}
