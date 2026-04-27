"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { ShieldAlert, CheckCircle, Flame, HeartPulse, ShieldCheck, Info, Globe } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { useUserStatus } from "@/hooks/useUserStatus";

type Language = "en" | "hi";

const TRANSLATIONS = {
  en: {
    portal_title: "Guest Portal",
    sos_subtitle: "Tap the button below in case of emergency.",
    sos_main_btn: "SOS",
    sos_sub_btn: "Emergency Request",
    sos_sending: "Sending Signal...",
    sos_footer: "Tap to request immediate assistance to your location",
    mark_safe: "Mark Safe",
    marked_safe: "SAFE",
    help_on_way: "HELP IS ON THE WAY TO",
    specify_emergency: "Please specify the type of emergency for faster response:",
    fire: "FIRE",
    medical: "MEDICAL",
    security: "SECURITY",
    responders_notified: "Responders Notified",
    first_aid_title: "First-Aid Instructions",
    all_clear_title: "All Clear",
    all_clear_msg: "The emergency has been resolved. Authorities have declared the area safe. You may resume normal activities.",
    acknowledge: "Acknowledge",
    room_prompt: "Please enter your room number or location:",
    room_req: "Room number is required to send help!",
    safe_prompt: "Please enter your room number to mark yourself safe:",
  },
  hi: {
    portal_title: "अतिथि पोर्टल",
    sos_subtitle: "आपातकाल की स्थिति में नीचे दिए गए बटन को दबाएं।",
    sos_main_btn: "आपात",
    sos_sub_btn: "आपातकालीन अनुरोध",
    sos_sending: "संकेत भेज रहा है...",
    sos_footer: "अपने स्थान पर तत्काल सहायता के लिए टैप करें",
    mark_safe: "सुरक्षित चिह्नित करें",
    marked_safe: "सुरक्षित",
    help_on_way: "सहायता रास्ते में है - कमरा",
    specify_emergency: "तेजी से प्रतिक्रिया के लिए कृपया आपातकाल के प्रकार को निर्दिष्ट करें:",
    fire: "आग",
    medical: "चिकित्सा",
    security: "सुरक्षा",
    responders_notified: "उत्तरदाताओं को सूचित किया गया",
    first_aid_title: "प्राथमिक चिकित्सा निर्देश",
    all_clear_title: "सब ठीक है",
    all_clear_msg: "आपातकाल का समाधान हो गया है। अधिकारियों ने क्षेत्र को सुरक्षित घोषित कर दिया है। आप सामान्य गतिविधियां फिर से शुरू कर सकते हैं।",
    acknowledge: "स्वीकार करें",
    room_prompt: "कृपया अपना कमरा नंबर या स्थान दर्ज करें:",
    room_req: "सहायता भेजने के लिए कमरा नंबर आवश्यक है!",
    safe_prompt: "स्वयं को सुरक्षित चिह्नित करने के लिए कृपया अपना कमरा नंबर दर्ज करें:",
  }
};

const FIRST_AID_INSTRUCTIONS: Record<Language, Record<string, string[]>> = {
  en: {
    "Fire 🔥": [
      "Stay low to the ground to avoid smoke.",
      "Touch doors with the back of your hand before opening.",
      "If clothes catch fire: Stop, Drop, and Roll.",
      "Exit via the nearest stairwell; do NOT use elevators."
    ],
    "Medical 🚑": [
      "Check if the person is conscious and breathing.",
      "If bleeding, apply firm, direct pressure to the wound.",
      "Do not move the person unless they are in immediate danger.",
      "Keep the person warm and comfortable until help arrives."
    ],
    "Security 🛡️": [
      "Lock and barricade doors if possible.",
      "Turn off lights and silence your phone.",
      "Stay out of sight and away from windows.",
      "Remain quiet and wait for an 'All Clear' from authorities."
    ]
  },
  hi: {
    "Fire 🔥": [
      "धुएं से बचने के लिए जमीन के करीब रहें।",
      "खोलने से पहले दरवाजों को अपने हाथ के पिछले हिस्से से छुएं।",
      "यदि कपड़ों में आग लग जाए: रुकें, झुकें और लुढ़कें।",
      "निकटतम सीढ़ी के माध्यम से बाहर निकलें; लिफ्ट का उपयोग न करें।"
    ],
    "Medical 🚑": [
      "जांचें कि क्या व्यक्ति सचेत है और सांस ले रहा है।",
      "यदि रक्तस्राव हो रहा है, तो घाव पर सीधा दबाव डालें।",
      "जब तक तत्काल खतरा न हो, व्यक्ति को न हिलाएं।",
      "सहायता आने तक व्यक्ति को गर्म और आरामदायक रखें।"
    ],
    "Security 🛡️": [
      "यदि संभव हो तो दरवाजे बंद करें और बैरिकेड लगाएं।",
      "लाइटें बंद करें और अपना फोन साइलेंट करें।",
      "नजरों से दूर रहें और खिड़कियों से दूर रहें।",
      "शांत रहें और अधिकारियों से 'सब ठीक है' के संकेत का इंतजार करें।"
    ]
  }
};

export default function SosPage() {
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [selectedTriage, setSelectedTriage] = useState<string | null>(null);
  const [room, setRoom] = useState<string>("");
  const [markedSafe, setMarkedSafe] = useState(false);

  const t = TRANSLATIONS[lang];

  const { triggerSOS, updateIncidentStatus } = useIncidents();
  const { headcounts, checkIn } = useUserStatus();

  const handleSOSClick = async () => {
    const roomNumber = window.prompt(t.room_prompt);
    
    if (!roomNumber) {
      alert(t.room_req);
      return;
    }

    setRoom(roomNumber);
    setLoading(true);
    try {
      const id = await triggerSOS(roomNumber, "Emergency assistance needed");
      if (id) {
        setIncidentId(id);
      }
      
      if (markedSafe) {
        await checkIn(roomNumber, "need_help");
        setMarkedSafe(false);
      }
    } catch (error) {
      console.error("Error triggering SOS", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async (type: string) => {
    if (!incidentId) return;
    try {
      await updateIncidentStatus(incidentId, "active", type);
      setSelectedTriage(type);
    } catch (error) {
      console.error("Error updating triage", error);
    }
  };

  const handleMarkSafe = async () => {
    let currentRoom = room;
    if (!currentRoom) {
      const promptRoom = window.prompt(t.safe_prompt);
      if (!promptRoom) return;
      currentRoom = promptRoom;
      setRoom(currentRoom);
    }

    try {
      await checkIn(currentRoom, "safe");
      setMarkedSafe(true);
    } catch (error) {
      console.error("Error marking safe", error);
    }
  };

  const toggleLang = () => setLang(prev => prev === "en" ? "hi" : "en");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Language Toggle */}
      <button 
        onClick={toggleLang}
        className="fixed top-20 right-6 z-20 bg-gray-900/80 border border-gray-800 p-3 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-2"
      >
        <Globe size={18} className="text-blue-400" />
        <span className="text-[10px] font-black uppercase tracking-widest">{lang === "en" ? "Hindi" : "English"}</span>
      </button>

      {/* All Clear Broadcast Overlay */}
      {headcounts.allClear && (
        <div className="fixed inset-0 z-50 bg-green-600 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
          <ShieldCheck size={120} className="mb-6 animate-bounce" />
          <h1 className="text-6xl font-black uppercase mb-4 tracking-tighter">{t.all_clear_title}</h1>
          <p className="text-2xl font-bold max-w-lg">{t.all_clear_msg}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 bg-white text-green-600 font-black px-12 py-4 rounded-full text-xl shadow-2xl hover:scale-105 transition-transform"
          >
            {t.acknowledge}
          </button>
        </div>
      )}

      {/* Header & Status */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <h2 className="text-xl font-black tracking-tighter uppercase opacity-50">EchoResponse</h2>
        {markedSafe ? (
          <div className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center space-x-2 font-bold animate-pulse">
            <CheckCircle size={18} />
            <span>{t.marked_safe}</span>
          </div>
        ) : (
          <button
            onClick={handleMarkSafe}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-full border border-gray-700 transition-all active:scale-95"
          >
            {t.mark_safe}
          </button>
        )}
      </div>

      {incidentId ? (
        <div className="w-full max-w-md z-10">
          {!selectedTriage ? (
            <div className="bg-gray-900 rounded-3xl p-8 border border-red-900/50 shadow-2xl">
              <ShieldAlert className="text-red-500 mx-auto mb-4 animate-pulse" size={48} />
              <h2 className="text-2xl font-black text-center mb-6">{t.help_on_way} {room}</h2>
              <p className="text-gray-400 text-center mb-6 font-bold text-sm leading-tight">{t.specify_emergency}</p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleTriage("Fire 🔥")} className="bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <Flame size={24} /> <span>{t.fire}</span>
                </button>
                <button onClick={() => handleTriage("Medical 🚑")} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <HeartPulse size={24} /> <span>{t.medical}</span>
                </button>
                <button onClick={() => handleTriage("Security 🛡️")} className="bg-yellow-600 hover:bg-yellow-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center space-x-3 transition-all active:scale-95">
                  <ShieldAlert size={24} /> <span>{t.security}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-green-600 rounded-3xl p-6 text-center shadow-2xl">
                <CheckCircle size={48} className="mx-auto mb-2" />
                <h2 className="text-2xl font-black uppercase">{t.responders_notified}</h2>
                <p className="font-bold opacity-80">Room {room} • {selectedTriage}</p>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl">
                <div className="flex items-center space-x-2 mb-6 text-blue-400">
                  <span className="text-blue-400"><Info size={24} /></span>
                  <h3 className="text-xl font-black uppercase tracking-tight">{t.first_aid_title}</h3>
                </div>
                <ul className="space-y-4">
                  {FIRST_AID_INSTRUCTIONS[lang][selectedTriage]?.map((step, i) => (
                    <li key={i} className="flex items-start space-x-4">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 font-medium leading-tight">{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={handleSOSClick}
            disabled={loading}
            className={`w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.5)] transition-all duration-300 active:scale-90 ${
              loading ? "bg-red-900" : "bg-red-600 hover:bg-red-500 animate-pulse"
            }`}
          >
            <span className="text-7xl font-black uppercase tracking-tighter mb-2">{t.sos_main_btn}</span>
            <span className="text-xs font-black opacity-80 uppercase tracking-widest">
              {loading ? t.sos_sending : t.sos_sub_btn}
            </span>
          </button>
          <p className="mt-12 text-gray-500 font-bold uppercase tracking-widest text-sm text-center max-w-xs">
            {t.sos_footer}
          </p>
        </div>
      )}
    </div>
  );
}
