// Global in-memory store for incidents and guest status
// Note: This will reset on Vercel function cold starts.

export type Priority = "high" | "medium" | "low";

export interface Incident {
  id: string;
  room: string;
  message: string;
  status: "active" | "resolved";
  triageType?: string;
  priority: Priority;
  createdAt: string;
}

export interface GuestStatus {
  room: string;
  status: "safe" | "need_help";
  updatedAt: string;
}

const PRIORITY_SCORE: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

class Store {
  private static instance: Store;
  private incidents: Incident[] = [];
  private guestStatuses: Record<string, GuestStatus> = {};
  private allClear: boolean = false;

  private constructor() {}

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  // Incidents
  public getIncidents(): Incident[] {
    return [...this.incidents].sort((a, b) => {
      // Sort by priority first, then by time
      if (a.status === "active" && b.status === "active") {
        const scoreA = PRIORITY_SCORE[a.priority];
        const scoreB = PRIORITY_SCORE[b.priority];
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public addIncident(room: string, message: string): Incident {
    const newIncident: Incident = {
      id: Math.random().toString(36).substring(2, 9),
      room,
      message,
      status: "active",
      priority: "low", // Default, will be updated by triage
      createdAt: new Date().toISOString(),
    };
    this.incidents.push(newIncident);
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const index = this.incidents.findIndex(i => i.id === id);
    if (index !== -1) {
      // Map triage type to priority
      if (updates.triageType) {
        if (updates.triageType.includes("Fire") || updates.triageType.includes("Medical")) {
          updates.priority = "high";
        } else if (updates.triageType.includes("Security")) {
          updates.priority = "medium";
        } else {
          updates.priority = "low";
        }
      }
      this.incidents[index] = { ...this.incidents[index], ...updates };
      return this.incidents[index];
    }
    return null;
  }

  // Guest Status
  public updateGuestStatus(room: string, status: "safe" | "need_help"): GuestStatus {
    const update = {
      room,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.guestStatuses[room] = update;
    return update;
  }

  public getStats() {
    const statuses = Object.values(this.guestStatuses);
    return {
      safe: statuses.filter(s => s.status === "safe").length,
      needHelp: statuses.filter(s => s.status === "need_help").length,
      totalGuests: statuses.length,
      totalIncidents: this.incidents.length,
      resolvedIncidents: this.incidents.filter(i => i.status === "resolved").length,
      pendingIncidents: this.incidents.filter(i => i.status === "active").length,
      allClear: this.allClear,
    };
  }

  public setAllClear(value: boolean) {
    this.allClear = value;
    if (value) {
      this.incidents = this.incidents.map(i => ({ ...i, status: "resolved" }));
    }
  }
}

export const store = Store.getInstance();
