import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getStats());
}

export async function POST(request: Request) {
  const { room, status } = await request.json();
  if (!room || !status) {
    return NextResponse.json({ error: "Room and status are required" }, { status: 400 });
  }
  
  const guestStatus = store.updateGuestStatus(room, status);
  return NextResponse.json(guestStatus);
}

export async function PATCH(request: Request) {
  const { allClear } = await request.json();
  if (typeof allClear !== "boolean") {
    return NextResponse.json({ error: "allClear boolean is required" }, { status: 400 });
  }
  
  store.setAllClear(allClear);
  return NextResponse.json({ success: true, allClear });
}
