import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getIncidents());
}

export async function POST(request: Request) {
  const { room, message } = await request.json();
  if (!room) return NextResponse.json({ error: "Room is required" }, { status: 400 });
  
  const incident = store.addIncident(room, message || "Emergency assistance needed");
  return NextResponse.json(incident);
}

export async function PATCH(request: Request) {
  const { id, status, triageType } = await request.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  
  const incident = store.updateIncident(id, { status, triageType });
  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  
  return NextResponse.json(incident);
}
