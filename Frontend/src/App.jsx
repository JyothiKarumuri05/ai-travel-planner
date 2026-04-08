import {
  SignIn,
  SignedIn,
  SignedOut,
  useClerk,
  useUser
} from "@clerk/clerk-react";

import { useState, useEffect } from "react";
import "./App.css";
import BookingAPI from "./BookingAPI";

/* ================= CLERK APPEARANCE THEME =================*/

const clerkAppearance = {
  variables: {
    colorPrimary: "#0E7490",
    colorBackground: "#ffffff",
    colorInputBackground: "#f0fafc",
    colorText: "#0d1f2d",
    colorTextSecondary: "#2a5060",
    colorNeutral: "#7aacb8",
    colorShimmer: "#ddf1f5",
  },
  elements: {
    /* Sidebar */
    navbar: {
      backgroundColor: "#eef4f6",
    },
    navbarButton: {
      color: "#0d1f2d",
      fontWeight: "500",
    },
    navbarButton__active: {
      backgroundColor: "#0f3347",
      color: "#ffffff",
      borderRadius: "8px",
    },

    /* Primary action button (Update profile) */
    formButtonPrimary: {
      backgroundColor: "#0f3347",
      color: "#ffffff",
    },

    /* Add email / Connect account rows */
    actionCard: {
      backgroundColor: "#e8f5f8",
      borderColor: "#b5dde5",
      color: "#0d1f2d",
    },
    profileSectionPrimaryButton: {
      backgroundColor: "#e8f5f8",
      borderColor: "#b5dde5",
      color: "#0d1f2d",
    },

    /* "Primary" badge */
    badge: {
      backgroundColor: "#ddf1f5",
      color: "#0f3347",
      borderColor: "#b5dde5",
    },

    /* "..." icon button */
    menuButton: {
      color: "#0f3347",
      backgroundColor: "#e8f5f8",
    },

    /* Modal close button */
    modalCloseButton: {
      backgroundColor: "#e2eef1",
      color: "#0d1f2d",
      borderRadius: "8px",
    },
  },
};

/* ---------------- NAVBAR ---------------- */

function Navbar({ goHome, goHistory, goMaps, goBooking }) {
  const { signOut, openUserProfile } = useClerk();

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={goHome} style={{ cursor: "pointer" }}>
        ✈️ AI Travel Planner
      </h2>

      <div className="nav-right">
        <button onClick={goHome}>🏠Home</button>
        <button onClick={goHistory}>📜Travel History</button>
        <button onClick={goMaps}> 🗺️Maps</button>
        <button onClick={goBooking}>🧳 Booking API</button>
        <button onClick={() => openUserProfile({ appearance: clerkAppearance })}>👤Profile</button>
        <button onClick={() => signOut()}>Logout</button>
      </div>
    </nav>
  );
}

/* ---------------- VOICE HOOK ---------------- */

function useVoiceInput(setField, setStatus) {
  return () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    setStatus("🎙️ Listening...");
    recognition.start();

    recognition.onresult = (event) => {
      setField(event.results[0][0].transcript);
      setStatus("");
    };

    recognition.onerror = () => setStatus("");
    recognition.onend = () => setStatus("");
  };
}

/* ---------------- TRAVEL FORM ---------------- */

function TravelForm() {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    current_city: "",
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
    group_type: "",
    travel_style: "",
    food_preference: ""
  });
  const cleanInput = (value) => {
  return value.trim().replace(/\.$/, ""); 
};

  const [status, setStatus] = useState({});
  const [itinerary, setItinerary] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [pendingIntent, setPendingIntent] = useState(null);

  const updateField = (field, value) => {
  const cleanedValue = cleanInput(value);
  setFormData(prev => ({ ...prev, [field]: cleanedValue }));
};

  const voiceCurrentCity = useVoiceInput(
    (v) => updateField("current_city", v),
    (msg) => setStatus(prev => ({ ...prev, current_city: msg }))
  );

  const voiceDestination = useVoiceInput(
    (v) => updateField("destination", v),
    (msg) => setStatus(prev => ({ ...prev, destination: msg }))
  );

  const voiceStartDate = useVoiceInput(
    (v) => updateField("start_date", v),
    (msg) => setStatus(prev => ({ ...prev, start_date: msg }))
  );

  const voiceEndDate = useVoiceInput(
    (v) => updateField("end_date", v),
    (msg) => setStatus(prev => ({ ...prev, end_date: msg }))
  );

  const voiceBudget = useVoiceInput(
    (v) => updateField("budget", v),
    (msg) => setStatus(prev => ({ ...prev, budget: msg }))
  );

  const voiceGroupType = useVoiceInput(
    (v) => updateField("group_type", v),
    (msg) => setStatus(prev => ({ ...prev, group_type: msg }))
  );

  const voiceTravelStyle = useVoiceInput(
    (v) => updateField("travel_style", v),
    (msg) => setStatus(prev => ({ ...prev, travel_style: msg }))
  );

  const voiceFoodPreference = useVoiceInput(
    (v) => updateField("food_preference", v),
    (msg) => setStatus(prev => ({ ...prev, food_preference: msg }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyField = Object.entries(formData).find(
      ([key, value]) => !value.trim()
    );
    if (emptyField) {
      alert(`Please fill in the ${emptyField[0].replace("_", " ")} field.`);
      return;
    }
    setLoading(true);

    try {
      await fetch("http://ai-travel-planner-production-43c1.up.railway.app/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.fullName || "User",
          email: user.primaryEmailAddress.emailAddress
        })
      });

      const response = await fetch("http://ai-travel-planner-production-43c1.up.railway.app/save-travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
      } else {
        setItinerary(result.itinerary);
        setRequestId(result.request_id);
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  const handleChatSend = async () => {
    if (!requestId || !chatMessage.trim()) return;

    const response = await fetch("http://ai-travel-planner-production-43c1.up.railway.app/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: requestId,
        user_message: chatMessage,
        pending_update: pendingIntent
      })
    });

    const result = await response.json();

    if (result.pending_update) setPendingIntent(result.pending_update);
    if (result.updated && result.itinerary) {
      setItinerary(result.itinerary);
      setPendingIntent(null);
    }

    setChatReply(result.reply);
    setChatMessage("");
  };

  const createRow = (label, field, voiceFn) => (
    <div className="form-row">
      <label>{label}</label>
      <input
        type="text"
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
      />
      <button type="button" onClick={voiceFn}>🎤</button>
      <span>{status[field]}</span>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="travel-form">
        {createRow("Enter Current City:", "current_city", voiceCurrentCity)}
        {createRow("Enter Destination:", "destination", voiceDestination)}
        {createRow("Enter Start Date (e.g. 9 nov):", "start_date", voiceStartDate)}
        {createRow("Enter End Date (e.g. 15 nov)", "end_date", voiceEndDate)}
        {createRow("Enter Budget (e.g. 4000 USD/INR/EURO etc):", "budget", voiceBudget)}
        {createRow("Enter Group Type with number of people (friends/couple/family):", "group_type", voiceGroupType)}
        {createRow("Enter Travel Style(e.g.Adventure/Romance/Nightlife/fun):", "travel_style", voiceTravelStyle)}
        {createRow("Food Preference (Veg/Non Veg):", "food_preference", voiceFoodPreference)}

        <button>{loading ? "Generating..." : "Submit"}</button>
      </form>

      {itinerary && (
        <div className="generated-plan">
          <h2>Your Travel Plan</h2>
          <pre>{itinerary}</pre>

          <div>
            <h3>Modify Plan</h3>
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button onClick={handleChatSend}>Send</button>
            {chatReply && <pre>{chatReply}</pre>}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- TRAVEL HISTORY ---------------- */

function TravelHistory() {
  const { user } = useUser();
  const [history, setHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetch(`http://ai-travel-planner-production-43c1.up.railway.app/travel-history/${user.id}`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [user]);

  if (selectedPlan) {
    return (
      <div className="generated-plan">
        <button onClick={() => setSelectedPlan(null)}>← Back</button>
        <h2>{selectedPlan.destination}</h2>

        <button
          onClick={() =>
            window.open(
              `http://ai-travel-planner-production-43c1.up.railway.app/download-pdf/${selectedPlan.request_id}`,
              "_blank"
            )
          }
        >
          📄 Download PDF
        </button>

        <pre>{selectedPlan.final_itinerary}</pre>
      </div>
    );
  }

  return (
    <div className="generated-plan">
      <h2>Travel History</h2>
      {history.map((item) => (
        <div key={item.id} onClick={() => setSelectedPlan(item)}>
          {item.destination} ({item.start_date} → {item.end_date})
        </div>
      ))}
    </div>
  );
}

/* ---------------- GOOGLE MAPS ---------------- */

function GoogleMapsNavigation() {
  const openMaps = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}`,
        "_blank"
      );
    });
  };

  return (
    <div className="generated-plan">
      <h2>Start Navigation</h2>
      <button onClick={openMaps}>Start</button>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard() {
  const [page, setPage] = useState("home");

  return (
    <>
      <Navbar
        goHome={() => setPage("home")}
        goHistory={() => setPage("history")}
        goMaps={() => setPage("maps")}
        goBooking={() => setPage("booking")}
      />

      <div className="main-content">
        {page === "home" && (
          <div className="home-hero">
            <div className="home-overlay">
              <h1 className="home-title">
                Plan your perfect trip with AI
              </h1>

              <div className="center-box">
                <img
                  src="/UserInputLogo.png"
                  alt="Logo"
                  className="home-logo"
                />

                <button
                  className="home-btn"
                  onClick={() => setPage("form")}
                >
                  Enter Travel Details
                </button>
              </div>
            </div>
          </div>
        )}

        {page === "form" && <TravelForm />}
        {page === "history" && <TravelHistory />}
        {page === "maps" && <GoogleMapsNavigation />}
        {page === "booking" && <BookingAPI />}
      </div>
    </>
  );
}

/* ---------------- APP ---------------- */

function App() {
  return (
    <>
      <SignedOut>
        <div className="auth-wrapper">
          <SignIn appearance={clerkAppearance} />
        </div>
      </SignedOut>

      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}

export default App;