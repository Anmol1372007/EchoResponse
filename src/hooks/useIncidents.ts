import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Priority = "high" | "medium" | "low";

export interface Incident {
  id: string;
  room: string;
  message: string;
  status: "active" | "resolved";
  triageType?: string;
  priority: Priority;
  createdAt: any;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Technical Requirement: Fetch BOTH active and resolved statuses from DB
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    
    // Technical Requirement: Use onSnapshot for real-time persistence
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];
      
      // Technical Logic: Priority sorting
      const sortedData = data.sort((a, b) => {
        if (a.status === "active" && b.status === "active") {
          const scores: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (scores[b.priority] || 0) - (scores[a.priority] || 0);
        }
        return 0;
      });

      setIncidents(sortedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerSOS = async (room: string, message: string) => {
    try {
      const docRef = await addDoc(collection(db, "incidents"), {
        room,
        message,
        status: "active",
        priority: "low",
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error triggering SOS", error);
    }
  };

  const updateIncidentStatus = async (id: string, status: "active" | "resolved", triageType?: string) => {
    try {
      const updates: any = { status };
      if (triageType) {
        updates.triageType = triageType;
        if (triageType.includes("Fire") || triageType.includes("Medical")) {
          updates.priority = "high";
        } else if (triageType.includes("Security")) {
          updates.priority = "medium";
        } else {
          updates.priority = "low";
        }
      }
      await updateDoc(doc(db, "incidents", id), updates);
    } catch (error) {
      console.error("Error updating incident", error);
    }
  };

  return { incidents, loading, triggerSOS, updateIncidentStatus };
}
