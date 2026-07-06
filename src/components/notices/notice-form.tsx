"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

const EMERGENCY_TEMPLATES = [
  {
    name: "Fire Alert",
    title: "FIRE ALERT - Immediate Action Required",
    body: "A fire has been reported in the building. All residents are advised to:\n1. Evacuate immediately via the nearest stairwell\n2. Do NOT use elevators\n3. Assembly point: Ground floor parking area\n4. Wait for further instructions from the RWA",
  },
  {
    name: "Water Supply Disruption",
    title: "Water Supply Disruption Notice",
    body: "Due to maintenance work, water supply will be disrupted from [TIME] to [TIME] on [DATE].\n\nPlease store adequate water for your daily needs.\n\nFor emergencies, contact the RWA office.",
  },
  {
    name: "Security Lockdown",
    title: "SECURITY LOCKDOWN - Stay Indoors",
    body: "A security alert has been issued. All residents are advised to:\n1. Stay indoors with doors locked\n2. Do NOT open doors to strangers\n3. Report any suspicious activity immediately\n4. Wait for the all-clear signal from security",
  },
  {
    name: "Power Outage",
    title: "Power Outage Notice",
    body: "There will be a scheduled power outage from [TIME] to [TIME] on [DATE] for electrical maintenance.\n\nThe backup generator will provide essential services only.\n\nWe apologize for the inconvenience.",
  },
];

export function NoticeForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [targetBlock, setTargetBlock] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const applyTemplate = (template: typeof EMERGENCY_TEMPLATES[0]) => {
    setTitle(template.title);
    setBody(template.body);
    setPriority("EMERGENCY");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, body, priority,
          targetBlock: targetBlock || null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) { setTitle(""); setBody(""); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Notice published</div>}

      {priority === "EMERGENCY" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Templates</label>
          <div className="flex gap-2 flex-wrap">
            {EMERGENCY_TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => applyTemplate(t)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="notice-title" className="text-sm font-medium">Title</label>
        <input id="notice-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notice-body" className="text-sm font-medium">Body</label>
        <textarea id="notice-body" value={body} onChange={(e) => setBody(e.target.value)} required rows={6}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="notice-priority" className="text-sm font-medium">Priority</label>
          <select id="notice-priority" value={priority} onChange={(e) => setPriority(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="notice-target" className="text-sm font-medium">Target Tower</label>
          <select id="notice-target" value={targetBlock} onChange={(e) => setTargetBlock(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="">All Towers</option>
            <option value="A">Tower A</option>
            <option value="B">Tower B</option>
            <option value="C">Tower C</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="notice-expires" className="text-sm font-medium">Expires</label>
          <input id="notice-expires" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <button type="submit" disabled={pending}
        className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-black transition-colors disabled:opacity-50 ${
          priority === "EMERGENCY" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gold hover:bg-gold-light"
        }`}>
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Publishing...</>
        ) : (
          priority === "EMERGENCY" ? "Send Emergency Broadcast" : "Publish Notice"
        )}
      </button>
    </form>
  );
}
