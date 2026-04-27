"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface SosButtonProps {
  onTrigger: () => Promise<void>;
  loading?: boolean;
}

export function SosButton({ onTrigger, loading = false }: SosButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePress = async () => {
    if (pressed || loading) return;
    setPressed(true);
    try {
      await onTrigger();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPressed(false);
      }, 5000); // Reset after 5 seconds
    } catch (error) {
      setPressed(false);
    }
  };

  if (success) {
    return (
      <button
        disabled
        className="w-full sm:w-64 aspect-square rounded-full flex flex-col items-center justify-center space-y-4 shadow-xl transition-all duration-300 bg-green-500 text-white"
      >
        <CheckCircle2 size={64} className="animate-bounce" />
        <span className="text-2xl font-bold uppercase tracking-widest">Help is on the way</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePress}
      disabled={pressed || loading}
      className={`relative w-full max-w-[300px] aspect-square rounded-full flex flex-col items-center justify-center space-y-4 shadow-[0_0_50px_rgba(220,38,38,0.5)] transition-all duration-300
        ${pressed || loading ? "bg-red-800 scale-95" : "bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95"}
        text-white overflow-hidden
      `}
    >
      <div className="absolute inset-0 rounded-full border-8 border-red-400 opacity-50 animate-ping"></div>
      <AlertTriangle size={64} className={loading ? "animate-spin" : ""} />
      <span className="text-4xl font-black uppercase tracking-widest">SOS</span>
      <span className="text-sm font-semibold opacity-90 uppercase">Press for Emergency</span>
    </button>
  );
}
