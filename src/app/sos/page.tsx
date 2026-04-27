"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle, Flame, HeartPulse, ShieldCheck, Info } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { useUserStatus } from "@/hooks/useUserStatus";

const FIRST_AID_INSTRUCTIONS: Record<string, string[]> = {
  "Fire 🔥": [
    "Stay low to the ground to avoid smoke.",
    "Touch doors with the back of your hand before opening.",
    "If clothes catch fire: Stop, Drop, and Roll.",
    "Exit via the nearest stairwell; do NOT use elevators."
  ],
  "Medical 🚑": [
    "Check if the person is conscious and breathing.",
    "If bleeding, apply firm, direct pressure to the wound.",
    "Do not move the person unless they are in immediate danger.",
    "Keep the person warm and comfortable until help arrives."
  ],
  "Security 🛡️": [
    "Lock and barricade doors if possible.",
    "Turn off lights and silence your phone.",
    "Stay out of sight and away from windows.",
    "Remain quiet and wait for an 'All Clear' from authorities."
  ]
};

export default function SosPage() {
  const [loading, setLoading] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [selectedTriage, setSelectedTriage] = useState<string | null>(null);
  const [room, setRoom] = useState<string>("");
  const [markedSafe, setMarkedSafe] = useState(false);

  const { triggerSOS, updateIncidentStatus } = useIncidents();
  const { headcounts, checkIn } = useUserStatus();

  const handleSOSClick = async () => {
    const roomNumber = window.prompt("Please enter your room number or location:");
    
    if (!roomNumber) {
      alert("Room number is required to send help!");
      return;
    }

    setRoom(roomNumber);
    setLoading(true);
    try {
      const id = await triggerSOS(roomNumber, "Emergency assistance needed");
      if (id) {
        setIncidentId(id);
      }
      
      if (markedSafe) {
        await checkIn(roomNumber, "need_help");
        setMarkedSafe(false);
      }
    } catch (error) {
      console.error("Error triggering SOS", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async (type: string) => {
    if (!incidentId) return;
    try {
      await updateIncidentStatus(incidentId, "active", type);
      setSelectedTriage(type);
    } catch (error) {
      console.error("Error updating triage", error);
    }
  };

  const handleMarkSafe = async () => {
    let currentRoom = room;
    if (!currentRoom) {
      const promptRoom = window.prompt("Please enter your room number to mark yourself safe:");
      if (!promptRoom) return;
      currentRoom = promptRoom;
      setRoom(currentRoom);
    }

    try {
      await checkIn(currentRoom, "safe");
      setMarkedSafe(true);
    } catch (error) {
      console.error("Error marking safe", error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* All Clear Broadcast Overlay */}
      {headcounts.allClear && (
        <div className="fixed inset-0 z-50 bg-green-600 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <ShieldCheck size={120} className="mb-6 animate-bounce" />
          <h1 className="text-6xl font-black uppercase mb-4 tracking-tighter">All Clear</h1>
          <p className="text-2xl font-bold max-w-lg">The emergency has been resolved. Authorities have declared the area safe. You may resume normal activities.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 bg-white text-green-600 font-black px-12 py-4 rounded-full text-xl shadow-2xl hover:scale-105 transition-transform"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Header & Status */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <h2 className="text-xl font-black tracking-tighter uppercase opacity-50">EchoResponse</h2>
        {markedSafe ? (
          <div className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center space-x-2 font-bold animate-pulse">
            <CheckCircle size={18} />
            <span>SAFE</span>
          </div>
        ) : (
          <button
            onClick={handleMarkSafe}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-full border border-gray-700 transition-all active:scale-95"
          >
            Mark Safe
          </button>
        )}
      </div>

      {incidentId ? (
        <div className="w-full max-w-md z-10">
          {!selectedTriage ? (
            <div className="bg-gray-900 rounded-3xl p-8 border border-red-900/50 shadow-2xl">
              <ShieldAlert className="text-red-500 mx-auto mb-4 animate-pulse" size={48} />
              <h2 className="text-2xl font-black text-center mb-6">HELP IS ON THE WAY TO {room}</h2>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleTriage("Fire 🔥")} className="bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <Flame size={24} /> <span>FIRE</span>
                </button>
                <button onClick={() => handleTriage("Medical 🚑")} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <HeartPulse size={24} /> <span>MEDICAL</span>
                </button>
                <button onClick={() => handleTriage("Security 🛡️")} className="bg-yellow-600 hover:bg-yellow-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <ShieldAlert size={24} /> <span>SECURITY</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-green-600 rounded-3xl p-6 text-center shadow-2xl">
                <CheckCircle size={48} className="mx-auto mb-2" />
                <h2 className="text-2xl font-black uppercase">Responders Notified</h2>
                <p className="font-bold opacity-80">Room {room} • {selectedTriage}</p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl">
                <div className="flex items-center space-x-2 mb-6 text-blue-400">
                  <Info size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight">First-Aid Instructions</h3>
                </div>
                <ul className="space-y-4">
                  {FIRST_AID_INSTRUCTIONS[selectedTriage]?.map((step, i) => (
                    <li key={i} className="flex items-start space-x-4">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 font-medium leading-tight">{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={handleSOSClick}
            disabled={loading}
            className={`w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.5)] transition-all duration-300 active:scale-90 ${
              loading ? "bg-red-900" : "bg-red-600 hover:bg-red-500 animate-pulse"
            }`}
          >
            <span className="text-7xl font-black uppercase tracking-tighter mb-2">SOS</span>
            <span className="text-xs font-black opacity-80 uppercase tracking-widest">
              {loading ? "Sending Signal..." : "Emergency Request"}
            </span>
          </button>
          <p className="mt-12 text-gray-500 font-bold uppercase tracking-widest text-sm text-center max-w-xs">
            Tap to request immediate assistance to your location
          </p>
        </div>
      )}
    </div>
  );
}
