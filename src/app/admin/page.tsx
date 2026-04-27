"use client";

import { useEffect, useRef, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Megaphone, 
  FileDown, 
  Activity, 
  CheckSquare, 
  ListTodo, 
  History 
} from "lucide-react";
import { useIncidents, Incident } from "@/hooks/useIncidents";
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

  // LOGIC: Separate Active and History without deleting from database
  // Stable useMemo prevents unnecessary re-renders of the entire list
  const activeIncidents = useMemo(() => incidents.filter((i) => i.status === "active"), [incidents]);
  const resolvedIncidents = useMemo(() => incidents.filter((i) => i.status === "resolved"), [incidents]);
  
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
    // Technical Logic: update status to 'resolved' instead of deleting
    await updateIncidentStatus(id, "resolved");
  };

  const handleAllClear = async () => {
    const confirmed = window.confirm("Are you sure? This will notify ALL guests and resolve ALL active incidents.");
    if (confirmed) {
      await broadcastAllClear(true);
    }
  };

  const handleResetSystem = async () => {
    await broadcastAllClear(false);
  };

  const downloadReport = () => {
    const headers = ["ID", "Room", "Triage", "Priority", "Status", "Time"];
    const rows = incidents.map(i => [
      i.id,
      i.room,
      i.triageType || "None",
      i.priority.toUpperCase(),
      i.status.toUpperCase(),
      new Date(i.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `EchoResponse_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 p-6 transition-all duration-500 ${hasActiveAlerts ? "shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]" : ""}`}>
      {/* War Room Border Glow */}
      {hasActiveAlerts && (
        <div className="fixed inset-0 border-4 border-red-600/50 pointer-events-none z-50 animate-pulse"></div>
      )}

      {/* Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Incidents</p>
            <p className="text-3xl font-black text-white">{incidents.length}</p>
          </div>
          <Activity className="text-blue-500 opacity-50" size={32} />
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Resolved</p>
            <p className="text-3xl font-black text-green-500">{resolvedIncidents.length}</p>
          </div>
          <CheckSquare className="text-green-500 opacity-50" size={32} />
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-3xl font-black text-red-500">{activeIncidents.length}</p>
          </div>
          <ListTodo className="text-red-500 opacity-50" size={32} />
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Safe Guests</p>
            <p className="text-3xl font-black text-emerald-400">{headcounts.safe}</p>
          </div>
          <ShieldCheck className="text-emerald-400 opacity-50" size={32} />
        </div>
      </div>

      <header className="mb-12 border-b border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center space-x-5">
          <div className={`p-4 rounded-2xl ${hasActiveAlerts ? "bg-red-900/40 text-red-500 animate-pulse" : "bg-gray-800 text-gray-400"}`}>
            <ShieldAlert size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white">War Room Command</h1>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Strategic Incident Response System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <button 
            onClick={downloadReport}
            className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 text-gray-300 font-black px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 border border-gray-700"
          >
            <FileDown size={20} />
            <span className="uppercase tracking-widest text-xs">Export Logs</span>
          </button>

          {headcounts.allClear ? (
            <button
              onClick={handleResetSystem}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-2xl transition-all active:scale-95"
            >
              <ShieldCheck size={20} />
              <span className="uppercase tracking-widest text-xs">Reset System</span>
            </button>
          ) : (
            <button
              onClick={handleAllClear}
              disabled={!hasActiveAlerts}
              className={`flex-1 md:flex-none px-10 py-4 rounded-2xl flex items-center justify-center space-x-3 font-black transition-all active:scale-95 shadow-xl ${
                hasActiveAlerts 
                  ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                  : "bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed"
              }`}
            >
              <Megaphone size={20} />
              <span className="uppercase tracking-widest text-xs">Broadcast All Clear</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-20 space-y-16">
        {/* SECTION 1: ACTIVE INCIDENTS FEED */}
        <section>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-gray-200">Active Alerts</h2>
          </div>

          <div className="space-y-6">
            {activeIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 bg-gray-900/20 rounded-[40px] border border-gray-800 border-dashed text-gray-600">
                <ShieldCheck size={80} className="mb-6 opacity-10 text-green-700" />
                <p className="font-black text-2xl tracking-tighter uppercase opacity-30">No Active Threats Detected</p>
              </div>
            ) : (
              activeIncidents.map((incident) => {
                const isHigh = incident.priority === "high";
                return (
                  <div 
                    key={incident.id} 
                    className={`bg-gray-900 p-8 rounded-[32px] border transition-all flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8 ${
                      isHigh 
                        ? "border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.15)] animate-pulse" 
                        : "border-gray-800"
                    }`}
                  >
                    <div className="flex items-start space-x-6">
                      <div className={`mt-2 p-4 rounded-2xl ${isHigh ? "bg-red-600 text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}>
                        <AlertTriangle size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="text-4xl font-black text-white tracking-tighter">ROOM {incident.room}</h2>
                          {incident.triageType && (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                              isHigh ? "bg-red-600 text-white" : "bg-yellow-600 text-white"
                            }`}>
                              {incident.triageType}
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-3 py-1 rounded-md border tracking-widest uppercase ${
                            isHigh ? "border-red-600 text-red-500" : "border-gray-700 text-gray-500"
                          }`}>
                            {incident.priority} PRIORITY
                          </span>
                        </div>
                        <p className="text-gray-400 text-xl font-medium mb-4 opacity-90">{incident.message}</p>
                        <div className="flex items-center space-x-4">
                          <p className="text-[10px] font-black text-gray-600 flex items-center uppercase tracking-widest">
                            <Clock size={12} className="mr-2" />
                            {new Date(incident.createdAt).toLocaleTimeString()}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EST. RESPONSE: 3M</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleResolve(incident.id)}
                      className="bg-white text-black hover:bg-gray-200 font-black tracking-widest uppercase py-6 px-12 rounded-2xl transition-all active:scale-95 shadow-2xl whitespace-nowrap text-sm self-stretch lg:self-center"
                    >
                      RESOLVE NOW
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 2: INCIDENT HISTORY (RESOLVED) */}
        <section className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center space-x-3 mb-10">
            <History className="text-gray-500" size={30} />
            <h2 className="text-2xl font-black tracking-tighter uppercase text-gray-400">Tactical History Log</h2>
          </div>

          <div className="bg-gray-900/30 rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="p-8">Location</th>
                    <th className="p-8">Crisis Type</th>
                    <th className="p-8">Outcome</th>
                    <th className="p-8">Resolved Time</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-700 font-bold uppercase tracking-widest text-xs italic">
                        Log archive is empty
                      </td>
                    </tr>
                  ) : (
                    resolvedIncidents.map((incident) => (
                      <tr key={incident.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-all">
                        <td className="p-8">
                          <span className="text-xl font-black text-gray-300 tracking-tighter">ROOM {incident.room}</span>
                        </td>
                        <td className="p-8">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{incident.triageType || "General Alert"}</span>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center space-x-2 text-green-500">
                            <CheckCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Successfully Resolved</span>
                          </div>
                        </td>
                        <td className="p-8 text-[10px] text-gray-600 font-mono">
                          {new Date(incident.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
