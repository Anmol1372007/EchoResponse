"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { useUserStatus } from "@/hooks/useUserStatus";

const playAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.error("Audio playback failed", error);
  }
};

export default function AdminPage() {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { headcounts } = useUserStatus();
  
  const previousIncidentsCount = useRef(0);
  const isFirstLoad = useRef(true);

  const activeIncidents = incidents.filter((i) => i.status === "active");
  const hasActiveAlerts = activeIncidents.length > 0;

  useEffect(() => {
    const activeCount = activeIncidents.length;

    if (!isFirstLoad.current && activeCount > previousIncidentsCount.current) {
      playAlertSound();
    }

    previousIncidentsCount.current = activeCount;
    isFirstLoad.current = false;
  }, [activeIncidents.length]);

  const handleResolve = async (id: string) => {
    await updateIncidentStatus(id, "resolved");
  };

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 p-6 transition-all duration-500 ${hasActiveAlerts ? "shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]" : ""}`}>
      {/* War Room Border Glow */}
      {hasActiveAlerts && (
        <div className="fixed inset-0 border-4 border-red-600/50 pointer-events-none z-50 animate-pulse"></div>
      )}

      <header className="mb-8 border-b border-gray-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${hasActiveAlerts ? "bg-red-900/50 text-red-500 animate-pulse" : "bg-gray-800 text-gray-400"}`}>
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase text-white">War Room Command</h1>
              <p className="text-gray-400 font-medium">EchoResponse Tactical Dashboard</p>
            </div>
          </div>

          {/* Live Statistics Card */}
          <div className="flex space-x-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center px-6 border-r border-gray-800">
              <span className="text-3xl font-black text-red-500">{activeIncidents.length}</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Active Alerts</span>
            </div>
            <div className="flex flex-col items-center px-6">
              <span className="text-3xl font-black text-green-500">{headcounts.safe}</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Safe Guests</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-gray-300">Live Incident Feed</h2>
        </div>

        <div className="space-y-4">
          {activeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed text-gray-600">
              <CheckCircle size={48} className="mb-4 opacity-50 text-green-700" />
              <p className="font-semibold text-lg tracking-widest uppercase">All Clear • Systems Nominal</p>
            </div>
          ) : (
            activeIncidents.map((incident) => (
              <div 
                key={incident.id} 
                className="bg-gray-900 p-6 rounded-2xl border border-red-900/50 flex flex-col md:flex-row md:justify-between md:items-center transition-all shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <AlertTriangle className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center space-x-3">
                      <span>Room {incident.room}</span>
                      {incident.triageType && (
                        <span className="bg-red-950 text-red-400 border border-red-900 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                          {incident.triageType}
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">{incident.message}</p>
                    <p className="text-xs text-gray-600 mt-3 flex items-center font-bold tracking-wider">
                      <Clock size={14} className="mr-1.5" />
                      {new Date(incident.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleResolve(incident.id)}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold tracking-widest uppercase py-3 px-8 rounded-xl transition-all active:scale-95 whitespace-nowrap"
                >
                  Resolve Incident
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
