"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { Incident } from "@/hooks/useIncidents";

interface LiveMapProps {
  incidents: Incident[];
}

// Dummy coordinates for rooms. In a real app, this would be fetched from a database.
const ROOM_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "401": { lat: 40.7128, lng: -74.0060 },
  "402": { lat: 40.7130, lng: -74.0062 },
  "403": { lat: 40.7132, lng: -74.0064 },
};

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // Example NYC location

export function LiveMap({ incidents }: LiveMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
        <p className="text-gray-500 font-medium">Google Maps API key missing.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-sm">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={18}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
        >
          {incidents.filter(i => i.status !== "resolved").map((incident) => {
            const position = ROOM_COORDINATES[incident.room] || DEFAULT_CENTER;
            return (
              <AdvancedMarker key={incident.id} position={position}>
                <Pin background={"#ef4444"} borderColor={"#b91c1c"} glyphColor={"#ffffff"} />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}
