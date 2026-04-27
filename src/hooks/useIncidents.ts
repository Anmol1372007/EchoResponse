import { useState, useEffect } from "react";

export interface Incident {
  id: string;
  room: string;
  message: string;
  status: "active" | "resolved";
  triageType?: string;
  createdAt: string;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      setIncidents(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Poll every 3 seconds for updates (hackathon-ready simple sync)
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerSOS = async (room: string, message: string) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, message }),
      });
      const newIncident = await res.json();
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident.id;
    } catch (error) {
      console.error("Error triggering SOS", error);
    }
  };

  const updateIncidentStatus = async (id: string, status: "active" | "resolved", triageType?: string) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, triageType }),
      });
      const updated = await res.json();
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
    } catch (error) {
      console.error("Error updating incident", error);
    }
  };

  return { incidents, loading, triggerSOS, updateIncidentStatus };
}
