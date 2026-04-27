// Global in-memory store for incidents and guest status
// Note: This will reset on Vercel function cold starts.

export interface Incident {
  id: string;
  room: string;
  message: string;
  status: "active" | "resolved";
  triageType?: string;
  createdAt: string;
}

export interface GuestStatus {
  room: string;
  status: "safe" | "need_help";
  updatedAt: string;
}

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
    return [...this.incidents].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addIncident(room: string, message: string): Incident {
    const newIncident: Incident = {
      id: Math.random().toString(36).substring(2, 9),
      room,
      message,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    this.incidents.push(newIncident);
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const index = this.incidents.findIndex(i => i.id === id);
    if (index !== -1) {
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
      total: statuses.length,
      allClear: this.allClear,
    };
  }

  public setAllClear(value: boolean) {
    this.allClear = value;
    if (value) {
      // Auto-resolve all active incidents when all clear is issued
      this.incidents = this.incidents.map(i => ({ ...i, status: "resolved" }));
    }
  }
}

export const store = Store.getInstance();
