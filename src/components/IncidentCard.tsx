import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Incident } from "@/hooks/useIncidents";

interface IncidentCardProps {
  incident: Incident;
  onUpdateStatus: (id: string, status: "active" | "resolved", triageType?: string) => void;
}

export function IncidentCard({ incident, onUpdateStatus }: IncidentCardProps) {
  const isResolved = incident.status === "resolved";
  
  const timeString = incident.createdAt 
    ? new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "Just now";

  return (
    <div className={`p-4 rounded-xl border-l-4 shadow-sm transition-all ${isResolved ? "border-green-500 bg-gray-50 opacity-75" : "border-red-500 bg-white"}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          {!isResolved ? (
            <AlertCircle className="text-red-500" size={20} />
          ) : (
            <CheckCircle className="text-green-500" size={20} />
          )}
          <h3 className="font-bold text-lg text-gray-900">Room {incident.room}</h3>
        </div>
        <span className="text-xs text-gray-500 flex items-center">
          <Clock size={14} className="mr-1" />
          {timeString}
        </span>
      </div>
      
      <p className="text-gray-700 text-sm mb-4">{incident.message}</p>
      
      <div className="flex space-x-2">
        {!isResolved && (
          <button
            onClick={() => onUpdateStatus(incident.id, "resolved")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Mark Resolved
          </button>
        )}
        {isResolved && (
          <button
            onClick={() => onUpdateStatus(incident.id, "active")}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Reopen Case
          </button>
        )}
      </div>
    </div>
  );
}
