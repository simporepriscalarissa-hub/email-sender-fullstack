import { useState, useRef } from "react";

const API_URL = "http://localhost:3001";

function TagInput({ label, value, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  const addTag = (val) => {
    const email = val.trim();
    if (!email) return;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !value.includes(email)) {
      onChange([...value, email]);
    }
    setInput("");
  };

  const handleKey = (e) => {
    if (["Enter", ",", " ", "Tab"].includes(e.key)) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={styles.label}>{label}</label>
      <div style={styles.tagContainer} onClick={() => inputRef.current?.focus()}>
        {value.map((tag, i) => (
          <span key={i} style={styles.tag}>
            {tag}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} style={styles.tagRemove}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          style={styles.tagInput}
        />
      </div>
      <span style={styles.hint}>Appuie sur Entrée pour ajouter</span>
    </div>
  );
}

export default function EmailSender() {
  const [form, setForm] = useState({ to: [], cc: [], bcc: [], subject: "", body: "" });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentCount, setSentCount] = useState(0);
  const [smtpStatus, setSmtpStatus] = useState(null);

  const checkSmtp = async () => {
    try {
      const res = await fetch(`${API_URL}/email/verify`);
      const data = await res.json();
      setSmtpStatus(data);
    } catch {
      setSmtpStatus({ connected: false, message: "Impossible de contacter le serveur" });
    }
  };

  const handleSend = async () => {
    if (!form.to.length || !form.subject || !form.body) {
      setErrorMsg("Remplis les champs : Destinataire, Objet et Message.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.to,
          subject: form.subject,
          body: form.body,
          ...(form.cc.length && { cc: form.cc }),
          ...(form.bcc.length && { bcc: form.bcc }),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setSentCount((c) => c + 1);
        setForm({ to: [], cc: [], bcc: [], subject: "", body: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        throw new Error(data.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow1} />
      <div style={styles.glow2} />
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>✉</div>
            <div>
              <h1 style={styles.title}>Email Sender</h1>
              
            </div>
          </div>
          <div style={styles.headerRight}>
            {sentCount > 0 && <div style={styles.badge}>{sentCount} envoyé{sentCount > 1 ? "s" : ""}</div>}
            <button onClick={checkSmtp} style={styles.smtpBtn}>Tester SMTP</button>
          </div>
        </div>

        {smtpStatus && (
          <div style={{ ...styles.alert, background: smtpStatus.connected ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", borderColor: smtpStatus.connected ? "#22c55e44" : "#ef444444", color: smtpStatus.connected ? "#4ade80" : "#f87171", marginBottom: "24px" }}>
            {smtpStatus.connected ? "🟢" : "🔴"} {smtpStatus.message}
            <button onClick={() => setSmtpStatus(null)} style={styles.closeAlert}>×</button>
          </div>
        )}

        <div style={styles.card}>
          <TagInput label="À *" value={form.to} onChange={(v) => setForm(f => ({ ...f, to: v }))} placeholder="destinataire@exemple.com" />

          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => setShowCcBcc(!showCcBcc)} style={styles.toggleBtn}>
              {showCcBcc ? "▼" : "▶"} CC / BCC
            </button>
            {showCcBcc && (
              <div style={styles.ccSection}>
                <TagInput label="CC" value={form.cc} onChange={(v) => setForm(f => ({ ...f, cc: v }))} placeholder="copie@exemple.com" />
                <TagInput label="BCC" value={form.bcc} onChange={(v) => setForm(f => ({ ...f, bcc: v }))} placeholder="copie-cachée@exemple.com" />
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={styles.label}>Objet *</label>
            <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Objet de l'email" style={styles.input} />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={styles.label}>Message *</label>
            <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Écris ton message ici..." rows={8} style={{ ...styles.input, resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }} />
          </div>

          {status === "success" && <div style={{ ...styles.alert, background: "rgba(34,197,94,0.1)", borderColor: "#22c55e44", color: "#4ade80", marginBottom: "16px" }}>✓ Email envoyé avec succès !</div>}
          {status === "error" && <div style={{ ...styles.alert, background: "rgba(239,68,68,0.1)", borderColor: "#ef444444", color: "#f87171", marginBottom: "16px" }}>✗ {errorMsg}</div>}

          <button onClick={handleSend} disabled={status === "loading"} style={{ ...styles.sendBtn, opacity: status === "loading" ? 0.7 : 1 }}>
            {status === "loading" ? "⟳ Envoi..." : "✉ Envoyer l'email"}
          </button>
        </div>

        <p style={styles.footer}><code style={styles.code}>localhost:3001</code></p>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b12; }
        input::placeholder, textarea::placeholder { color: #3a4050; }
        input:focus, textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#080b12", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden", padding: "40px 20px" },
  glow1: { position: "fixed", top: "-200px", left: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  glow2: { position: "fixed", bottom: "-150px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)", pointerEvents: "none" },
  wrapper: { maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 1 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  logo: { width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #6366f1, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 0 30px rgba(99,102,241,0.3)" },
  title: { fontSize: "24px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "12px", color: "#475569", marginTop: "2px", fontFamily: "'DM Mono', monospace" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontFamily: "'DM Mono', monospace" },
  smtpBtn: { background: "transparent", color: "#64748b", border: "1px solid #1e293b", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Sora', sans-serif" },
  alert: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", border: "1px solid", fontSize: "13px", fontWeight: "500", position: "relative" },
  closeAlert: { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "18px", opacity: 0.6 },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "36px", backdropFilter: "blur(10px)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" },
  label: { display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'DM Mono', monospace" },
  tagContainer: { display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 14px", background: "#0d1117", border: "1px solid #1e293b", borderRadius: "10px", cursor: "text", minHeight: "44px", alignItems: "center" },
  tag: { background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: "6px" },
  tagRemove: { background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: 0, opacity: 0.7 },
  tagInput: { flex: 1, minWidth: "150px", background: "transparent", border: "none", color: "#e2e8f0", fontSize: "14px", fontFamily: "'Sora', sans-serif", outline: "none" },
  hint: { display: "block", fontSize: "11px", color: "#334155", marginTop: "5px", fontFamily: "'DM Mono', monospace" },
  toggleBtn: { background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace", padding: "4px 0" },
  ccSection: { marginTop: "16px", padding: "20px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px" },
  input: { width: "100%", background: "#0d1117", border: "1px solid #1e293b", borderRadius: "10px", padding: "11px 14px", color: "#e2e8f0", fontSize: "14px", fontFamily: "'Sora', sans-serif" },
  sendBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #14b8a6)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "600", fontFamily: "'Sora', sans-serif", cursor: "pointer", boxShadow: "0 0 30px rgba(99,102,241,0.25)" },
  footer: { textAlign: "center", marginTop: "24px", color: "#2d3748", fontSize: "12px", fontFamily: "'DM Mono', monospace" },
  code: { background: "#1a2235", padding: "2px 6px", borderRadius: "4px", color: "#64748b" },
};