import { FormEvent, useMemo, useState, useEffect } from "react";
import { CalendarDays, Check, Clock3, Heart, Users, Edit3 } from "lucide-react";
import { EVENT, MEAL_OPTIONS } from "./config";

type Attendance = "yes" | "no" | "";

type FormState = {
  name: string;
  email: string;
  attendance: Attendance;
  guests: string;
  guestNames: string;
  meal: string;
  dietary: string;
  message: string;
  inviteCode: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  attendance: "",
  guests: "1",
  guestNames: "",
  meal: "",
  dietary: "",
  message: "",
  inviteCode: ""
};

const LOCAL_STORAGE_KEY = "user_rsvp_data";

function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedRsvp, setSavedRsvp] = useState<FormState | null>(null);

  // Load existing RSVP from local storage on load
  useEffect(() => {
    const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        setSavedRsvp(parsed);
        setSubmitted(true);
      } catch (err) {
        console.error("Failed to parse saved RSVP:", err);
      }
    }
  }, []);

  const guestCount = useMemo(
    () => Math.max(1, Math.min(10, Number(form.guests) || 1)),
    [form.guests]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitRsvp(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.attendance) return setError("Please tell us whether you can attend.");
    if (EVENT.requireInviteCode && !form.inviteCode.trim()) {
      return setError("Please enter your invitation code.");
    }

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      attendance: form.attendance,
      inviteCode: form.inviteCode.trim(),
      message: form.message.trim(),
      guests: form.attendance === "yes" ? guestCount : 0,
      guestNames: form.attendance === "yes" && guestCount > 1 ? form.guestNames.trim() : "",
      meal: form.attendance === "yes" ? form.meal : "",
      dietary: form.attendance === "yes" ? form.dietary.trim() : "",
      submittedAt: new Date().toISOString()
    };

    try {
      if (EVENT.rsvpEndpoint === "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE") {
        await new Promise((resolve) => setTimeout(resolve, 700));
        console.log("RSVP demo submission:", payload);
      } else {
        const response = await fetch(EVENT.rsvpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.message || "Invalid invitation code. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      // Store form data locally to prevent re-submission
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      setSavedRsvp(form);
      setSubmitted(true);
    } catch {
      setError("Something went wrong while sending your RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- SUBMITTED STATE VIEW ---
  if (submitted) {
    const displayData = savedRsvp || form;
    const isAttending = displayData.attendance === "yes";

    return (
      <main>
        <section className="hero">
          {EVENT.heroImage && <img className="hero-image" src={EVENT.heroImage} alt="" />}
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Save the date</p>
            <h1>{EVENT.title}</h1>
            <div className="heart"><Heart size={18} fill="currentColor" /></div>
            <p className="hero-title">Event.couple</p>
            <p className="hero-date">{EVENT.date}</p>
          </div>
        </section>

        <section className="page content">
          <div className="details">
            <div><CalendarDays /><span><b>{EVENT.date}</b><small>{EVENT.rsvpDeadline && `RSVP by ${EVENT.rsvpDeadline}`}</small></span></div>
            <div><Clock3 /><span><b>{EVENT.time}</b><small>Ceremony & celebration</small></span></div>
          </div>

          <div className="card success-card">
            <div className="success-icon"><Check size={28} /></div>
            <p className="eyebrow">RSVP Received</p>
            <h1>Thank you, {displayData.name.split(" ")[0]}!</h1>
            <p className="lead">
              {isAttending
                ? "We have received your RSVP and can't wait to celebrate with you."
                : "We're sorry you can't make it, but thank you for letting us know."}
            </p>

            <div className="rsvp-summary">
              <h3>Your Response Details:</h3>
              <p><strong>Name:</strong> {displayData.name}</p>
              {displayData.email && <p><strong>Email:</strong> {displayData.email}</p>}
              <p><strong>Attending:</strong> {isAttending ? "Yes" : "No"}</p>
              
              {isAttending && (
                <>
                  <p><strong>Guests:</strong> {displayData.guests}</p>
                  {displayData.guestNames && <p><strong>Additional Guests:</strong> {displayData.guestNames}</p>}
                  {displayData.meal && <p><strong>Meal Choice:</strong> {displayData.meal}</p>}
                  {displayData.dietary && <p><strong>Dietary Restrictions:</strong> {displayData.dietary}</p>}
                </>
              )}
              {displayData.message && <p><strong>Message:</strong> {displayData.message}</p>}
            </div>

            <div className="edit-notice">
              <Edit3 size={18} />
              <span>Need to change your response? Please contact the hosts directly.</span>
            </div>
          </div>
        </section>

        <footer>Made with love · {EVENT.couple}</footer>
      </main>
    );
  }

  // --- FORM INPUT VIEW ---
  return (
    <main>
      <section className="hero">
        {EVENT.heroImage && <img className="hero-image" src={EVENT.heroImage} alt="" />}
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Save the date</p>
          <h1>{EVENT.title}</h1>
          <div className="heart"><Heart size={18} fill="currentColor" /></div>
          <p className="hero-title">{EVENT.couple}</p>
          <p className="hero-date">{EVENT.date}</p>
        </div>
      </section>

      <section className="page content">
        <div className="details">
          <div><CalendarDays /><span><b>{EVENT.date}</b><small>{EVENT.rsvpDeadline && `RSVP by ${EVENT.rsvpDeadline}`}</small></span></div>
          <div><Clock3 /><span><b>{EVENT.time}</b><small>Ceremony & celebration</small></span></div>
        </div>

        <div className="intro">
          <p className="eyebrow">Please join us</p>
          <h2>Kindly RSVP below</h2>
          <p>We would love to celebrate this special day with you. Please submit one RSVP per invitation.</p>
        </div>

        <form className="card form-card" onSubmit={submitRsvp}>
          <div className="field">
            <label htmlFor="name">Your name <span>*</span></label>
            <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" autoComplete="name" />
          </div>

          <div className="field">
            <label htmlFor="email">Email <small>(optional)</small></label>
            <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>

          {EVENT.requireInviteCode && (
            <div className="field">
              <label htmlFor="inviteCode">Invitation code <span>*</span></label>
              <input id="inviteCode" value={form.inviteCode} onChange={(e) => update("inviteCode", e.target.value)} placeholder="Enter your code" />
            </div>
          )}

          <fieldset>
            <legend>Will you be joining us? <span>*</span></legend>
            <div className="choice-grid">
              <button type="button" className={`choice ${form.attendance === "yes" ? "selected" : ""}`} onClick={() => update("attendance", "yes")}>
                <span>Yes, happily!</span><small>Can't wait to celebrate</small>
              </button>
              <button type="button" className={`choice ${form.attendance === "no" ? "selected" : ""}`} onClick={() => update("attendance", "no")}>
                <span>Sadly, no</span><small>We'll be thinking of you</small>
              </button>
            </div>
          </fieldset>

          {form.attendance === "yes" && (
            <>
              <div className="field">
                <label htmlFor="guests">Number attending</label>
                <select id="guests" value={form.guests} onChange={(e) => update("guests", e.target.value)}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
                </select>
              </div>

              {guestCount > 1 && (
                <div className="field">
                  <label htmlFor="guestNames">Names of additional guests</label>
                  <textarea id="guestNames" value={form.guestNames} onChange={(e) => update("guestNames", e.target.value)} placeholder="Please list each name" rows={3} />
                </div>
              )}

              <div className="field">
                <label htmlFor="meal">Meal preference</label>
                <select id="meal" value={form.meal} onChange={(e) => update("meal", e.target.value)}>
                  <option value="">Select one</option>
                  {MEAL_OPTIONS.map((meal) => <option key={meal}>{meal}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="dietary">Dietary restrictions <small>(optional)</small></label>
                <input id="dietary" value={form.dietary} onChange={(e) => update("dietary", e.target.value)} placeholder="Allergies or dietary requirements" />
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="message">A message for us <small>(optional)</small></label>
            <textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Leave us a note..." rows={4} />
          </div>

          {error && <div className="error">{error}</div>}

          <button className="button" disabled={submitting}>
            {submitting ? "Sending..." : "Send RSVP"}
          </button>
        </form>
      </section>

      <footer>Made with love · {EVENT.couple}</footer>
    </main>
  );
}

export default App;