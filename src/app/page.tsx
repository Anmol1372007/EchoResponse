import Link from "next/link";
import { ShieldAlert, User, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-gray-900 to-black z-0" />
      
      <div className="z-10 text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-red-600 p-4 rounded-2xl shadow-2xl shadow-red-500/20">
            <ShieldAlert size={48} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-black mb-4 tracking-tight">EchoResponse</h1>
        <p className="text-xl text-gray-400 mb-12">
          Decentralized Crisis Coordination Platform
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            href="/sos?room=402"
            className="group relative bg-gray-800 hover:bg-gray-700 border border-gray-700 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center text-center"
          >
            <div className="bg-red-500/10 p-4 rounded-full mb-4 group-hover:bg-red-500/20 transition-colors">
              <User size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Guest Portal</h2>
            <p className="text-sm text-gray-400">Trigger SOS, report safety status, receive dynamic instructions.</p>
          </Link>

          <Link 
            href="/admin"
            className="group relative bg-gray-800 hover:bg-gray-700 border border-gray-700 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center text-center"
          >
            <div className="bg-blue-500/10 p-4 rounded-full mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Users size={32} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Command Center</h2>
            <p className="text-sm text-gray-400">Manage incidents, view live map, trigger global emergency mode.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
