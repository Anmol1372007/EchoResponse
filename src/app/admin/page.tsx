"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, ShieldCheck, Megaphone } from "lucide-react";
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
  const { headcounts, broadcastAllClear } = useUserStatus();
  
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

  const handleAllClear = async () => {
    const confirmed = window.confirm("Are you sure? This will notify ALL guests and resolve ALL active incidents.");
    if (confirmed) {
      await broadcastAllClear(true);
      // Reset broadcast after a delay if needed, or keep it until manually cleared
    }
  };

  const handleResetSystem = async () => {
    await broadcastAllClear(false);
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
              <p className="text-gray-400 font-medium tracking-tighter uppercase text-xs">EchoResponse Tactical Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Live Statistics Card */}
            <div className="flex space-x-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl">
              <div className="flex flex-col items-center px-6 border-r border-gray-800">
                <span className="text-3xl font-black text-red-500">{activeIncidents.length}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Active Alerts</span>
              </div>
              <div className="flex flex-col items-center px-6">
                <span className="text-3xl font-black text-green-500">{headcounts.safe}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Safe Guests</span>
              </div>
            </div>

            {/* Broadcast Controls */}
            {headcounts.allClear ? (
              <button
                onClick={handleResetSystem}
                className="bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-2xl flex items-center space-x-3 shadow-2xl transition-all active:scale-95"
              >
                <ShieldCheck size={24} />
                <span className="uppercase tracking-widest">System Clear</span>
              </button>
            ) : (
              <button
                onClick={handleAllClear}
                className={`px-8 py-4 rounded-2xl flex items-center space-x-3 font-black transition-all active:scale-95 shadow-xl ${
                  hasActiveAlerts 
                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                    : "bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed"
                }`}
                disabled={!hasActiveAlerts}
              >
                <Megaphone size={24} />
                <span className="uppercase tracking-widest text-sm">Broadcast All Clear</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <h2 className="text-xl font-bold tracking-widest uppercase text-gray-300">Live Incident Feed</h2>
          </div>
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Real-time status updates</p>
        </div>

        <div className="space-y-4">
          {activeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed text-gray-600">
              <ShieldCheck size={64} className="mb-4 opacity-20 text-green-700" />
              <p className="font-black text-xl tracking-widest uppercase opacity-40 italic">All Clear • Systems Nominal</p>
            </div>
          ) : (
            activeIncidents.map((incident) => (
              <div 
                key={incident.id} 
                className="bg-gray-900 p-8 rounded-3xl border border-red-900/30 flex flex-col md:flex-row md:justify-between md:items-center transition-all shadow-[0_0_50px_rgba(220,38,38,0.05)] hover:shadow-[0_0_60px_rgba(220,38,38,0.15)] gap-6"
              >
                <div className="flex items-start space-x-6">
                  <div className="mt-2 p-3 bg-red-950/50 rounded-xl">
                    <AlertTriangle className="text-red-500" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white flex items-center space-x-4">
                      <span className="tracking-tighter">ROOM {incident.room}</span>
                      {incident.triageType && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg">
                          {incident.triageType}
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 mt-2 text-lg font-medium opacity-80">{incident.message}</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <p className="text-[10px] font-black text-gray-600 flex items-center uppercase tracking-widest">
                        <Clock size={12} className="mr-2" />
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Priority Alpha</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleResolve(incident.id)}
                  className="bg-white text-black hover:bg-gray-200 font-black tracking-widest uppercase py-5 px-10 rounded-2xl transition-all active:scale-95 shadow-xl whitespace-nowrap text-sm"
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
