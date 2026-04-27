import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUserStatus() {
  const [headcounts, setHeadcounts] = useState({ safe: 0, needHelp: 0, total: 0, allClear: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to guest status collection
    const unsubscribeStatus = onSnapshot(collection(db, "guestStatus"), (snapshot) => {
      const statuses = snapshot.docs.map(doc => doc.data());
      const safe = statuses.filter(s => s.status === "safe").length;
      const needHelp = statuses.filter(s => s.status === "need_help").length;
      
      setHeadcounts(prev => ({
        ...prev,
        safe,
        needHelp,
        total: statuses.length,
      }));
      setLoading(false);
    });

    // Listen to global settings for All Clear
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        setHeadcounts(prev => ({
          ...prev,
          allClear: snapshot.data().allClear || false,
        }));
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSettings();
    };
  }, []);

  const checkIn = async (room: string, status: "safe" | "need_help") => {
    try {
      await setDoc(doc(db, "guestStatus", room), {
        room,
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error during check-in", error);
    }
  };

  const broadcastAllClear = async (allClear: boolean) => {
    try {
      await setDoc(doc(db, "settings", "global"), { allClear }, { merge: true });
    } catch (error) {
      console.error("Error broadcasting all clear", error);
    }
  };

  return { headcounts, loading, checkIn, broadcastAllClear };
}
