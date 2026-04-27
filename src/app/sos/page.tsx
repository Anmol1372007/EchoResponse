"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { useUserStatus } from "@/hooks/useUserStatus";

export default function SosPage() {
  const [loading, setLoading] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [triageSent, setTriageSent] = useState(false);
  const [room, setRoom] = useState<string>("");
  const [markedSafe, setMarkedSafe] = useState(false);

  const { triggerSOS, updateIncidentStatus } = useIncidents();
  const { checkIn } = useUserStatus();

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
      alert("Failed to trigger SOS. Please try again or call emergency services.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async (type: string) => {
    if (!incidentId) return;
    try {
      await updateIncidentStatus(incidentId, "active", type);
      setTriageSent(true);
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute top-4 right-4">
        {markedSafe ? (
          <div className="bg-green-600/20 text-green-500 border border-green-500 px-4 py-2 rounded-full flex items-center space-x-2">
            <CheckCircle size={18} />
            <span className="font-bold text-sm">Marked Safe</span>
          </div>
        ) : (
          <button
            onClick={handleMarkSafe}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-4 py-2 rounded-full border border-gray-600 transition-colors"
          >
            Mark Myself Safe
          </button>
        )}
      </div>

      <div className="text-center mb-12 mt-12">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Guest Portal</h1>
        <p className="text-gray-400 text-lg">Tap the button below in case of emergency.</p>
      </div>

      {incidentId ? (
        <div className="w-full max-w-md bg-gray-900 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.3)] border border-red-900">
          {!triageSent ? (
            <div className="text-center">
              <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-6">Help is on the way to {room}</h2>
              <p className="text-gray-400 mb-6">Please specify the type of emergency for faster response:</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleTriage("Fire 🔥")} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl text-xl transition-transform active:scale-95">
                  Fire 🔥
                </button>
                <button onClick={() => handleTriage("Medical 🚑")} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-xl transition-transform active:scale-95">
                  Medical 🚑
                </button>
                <button onClick={() => handleTriage("Security 🛡️")} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl text-xl transition-transform active:scale-95">
                  Security 🛡️
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Details Sent</h2>
              <p className="text-gray-400">First responders have been notified with your exact situation. Please stay safe.</p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleSOSClick}
          disabled={loading}
          className={`w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.6)] transition-transform duration-200 active:scale-95 ${
            loading ? "bg-red-800" : "bg-red-600 hover:bg-red-500 animate-pulse"
          }`}
        >
          <span className="text-5xl font-black uppercase tracking-widest mb-2">SOS</span>
          <span className="text-sm font-semibold opacity-90 uppercase">
            {loading ? "Sending..." : "Tap to Request Help"}
          </span>
        </button>
      )}

      <div className="mt-16 text-center text-xs text-gray-600">
        <p>Your location will be recorded to dispatch responders.</p>
      </div>
    </div>
  );
}
