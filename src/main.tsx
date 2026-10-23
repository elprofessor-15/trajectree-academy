import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Target,
  Layers,
  CalendarDays,
  ChartNoAxesCombined,
  ContactRound,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Menu,
  Leaf,
  Settings,
  Download,
  RotateCcw,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Flag,
  Footprints,
  Trophy,
} from "lucide-react";
import type { Store, Player, Plan } from "./data";
import {
  initial,
  load,
  uid,
  today,
  latest,
  progress,
  formatDate,
} from "./data";
import "./style.css";
const pages = [
  "Overview",
  "Players",
  "Assessments",
  "Development plans",
  "Development clusters",
  "Interventions",
  "Progress & reports",
  "Player passport",
] as const;
type Page = (typeof pages)[number];
const icons = [
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Target,
  Layers,
  CalendarDays,
  ChartNoAxesCombined,
  ContactRound,
];
const focuses = [
  "First touch",
  "Scanning",
  "Finishing",
  "Passing",
  "Positioning",
  "Fitness",
  "Confidence",
];
type Modal =
  | "player"
  | "assessment"
  | "plan"
  | "cluster"
  | "intervention"
  | "measurement"
  | "settings"
  | "notifications"
  | "session"
  | null;
const avg = (a: number[]) =>
  a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
function Pitch() {
  return (
    <div className="pitch">
      <div className="pitch-half" />
      <div className="pitch-center" />
      <div className="goal left" />
      <div className="goal right" />
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <i
          key={n}
          style={{ left: `${15 + n * 10}%`, top: `${25 + (n % 3) * 23}%` }}
        />
      ))}
    </div>
  );
}
function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Avatar({
  player,
  large = false,
}: {
  player: Player;
  large?: boolean;
}) {
  return (
    <span className={`avatar av${player.number % 5} ${large ? "large" : ""}`}>
      {initials(player.name)}
      <small>{player.number}</small>
    </span>
  );
}
function App() {
  const [s, setS] = useState<Store>(load),
    [page, setPage] = useState<Page>("Overview"),
    [modal, setModal] = useState<Modal>(null),
    [selected, setSelected] = useState("p1"),
    [search, setSearch] = useState(""),
    [squad, setSquad] = useState("All squads"),
    [role, setRole] = useState("Coach"),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(""),
    [edit, setEdit] = useState(""),
    [sessionId, setSessionId] = useState(""),
    [passportTab, setPassportTab] = useState("Overview"),
    [error, setError] = useState(""),
    [formPlayer, setFormPlayer] = useState("p1"),
    [resetConfirm, setResetConfirm] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("trajectory-v1", JSON.stringify(s));
    } catch {
      setError(
        "Browser storage is unavailable. Export your data before leaving.",
      );
    }
  }, [s]);
  useEffect(() => {
    if (!modal) return;
    const before = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".modal button,.modal input,.modal select,.modal textarea",
        ),
      ).filter((n) => !n.hasAttribute("disabled"));
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trap);
      before?.focus();
    };
  }, [modal]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    setSearch("");
    setMobile(false);
    window.scrollTo(0, 0);
  }, [page]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const player = s.players.find((p) => p.id === selected) || s.players[0];
  const visible = s.players.filter(
    (p) =>
      (squad === "All squads" || p.squad === squad) &&
      `${p.name} ${p.position}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredIds = new Set(
    s.players
      .filter((p) => squad === "All squads" || p.squad === squad)
      .map((p) => p.id),
  );
  const plans = s.plans.filter((p) => filteredIds.has(p.playerId));
  const assessed = new Set(
    s.assessments
      .filter((a) => filteredIds.has(a.playerId))
      .map((a) => a.playerId),
  );
  const approved = plans.filter((p) => p.approved);
  const squadSessions = s.interventions.filter(
    (i) =>
      squad === "All squads" ||
      s.plans.some((p) => p.id === i.planId && filteredIds.has(p.playerId)) ||
      s.clusters.some(
        (c) =>
          c.id === i.clusterId && c.playerIds.some((id) => filteredIds.has(id)),
      ),
  );
  const score = (id: string) => {
    const a = [...s.assessments]
      .filter((a) => a.playerId === id)
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1);
    return a
      ? avg([a.technical, a.physical, a.tactical, a.psychological])
      : null;
  };
  const open = (m: Modal, id = "") => {
    setEdit(id);
    setFormPlayer(s.plans.find((p) => p.id === id)?.playerId || selected);
    setError("");
    setResetConfirm(false);
    setModal(m);
  };
  const go = (p: Page) => setPage(p);
  const viewPlayer = (id: string) => {
    setSelected(id);
    setPassportTab("Overview");
    go("Player passport");
  };
  const save = (next: Store, message: string) => {
    setS(next);
    setModal(null);
    setToast(message);
    setError("");
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "trajectory-academy.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setToast("Academy data exported");
  };
  const record = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) || "").trim();
    const num = (k: string) => Number(f.get(k));
    const id = uid();
    if (modal === "player") {
      if (!str("name")) return setError("Enter a player name.");
      save(
        {
          ...s,
          players: [
            ...s.players,
            {
              id,
              name: str("name"),
              age: num("age"),
              position: str("position"),
              squad: str("squad"),
              number: num("number"),
              tier: str("tier"),
            },
          ],
        },
        "Player added to the academy",
      );
    }
    if (modal === "assessment") {
      save(
        {
          ...s,
          assessments: [
            ...s.assessments,
            {
              id,
              playerId: str("playerId"),
              date: str("date"),
              technical: num("technical"),
              physical: num("physical"),
              tactical: num("tactical"),
              psychological: num("psychological"),
              notes: str("notes"),
            },
          ],
        },
        "Assessment saved. Review the player’s development priorities.",
      );
    }
    if (modal === "plan") {
      if (
        f.get("approved") === "on" &&
        !s.assessments.some((a) => a.playerId === str("playerId"))
      )
        return setError(
          "Record an assessment for this player before approving a plan.",
        );
      if (num("target") <= num("baseline"))
        return setError(
          "Target must be greater than baseline for this improvement goal.",
        );
      const p = {
        id: edit || id,
        playerId: str("playerId"),
        title: str("title"),
        focus: str("focus"),
        baseline: num("baseline"),
        target: num("target"),
        unit: str("unit"),
        deadline: str("deadline"),
        notes: str("notes"),
        approved: f.get("approved") === "on",
      };
      save(
        {
          ...s,
          plans: edit
            ? s.plans.map((x) => (x.id === edit ? p : x))
            : [...s.plans, p],
        },
        edit ? "Development plan updated" : "Development plan created",
      );
    }
    if (modal === "cluster") {
      const ids = f.getAll("playerIds").map(String);
      if (!ids.length) return setError("Select at least one player.");
      save(
        {
          ...s,
          clusters: [
            ...s.clusters,
            {
              id,
              name: str("name"),
              focus: str("focus"),
              coach: str("coach"),
              playerIds: ids,
            },
          ],
        },
        "Development cluster created",
      );
    }
    if (modal === "intervention") {
      const p = s.plans.find((p) => p.id === str("planId"));
      if (
        str("clusterId") &&
        p &&
        !s.clusters
          .find((c) => c.id === str("clusterId"))
          ?.playerIds.includes(p.playerId)
      )
        return setError(
          "The player on the linked plan must belong to the selected cluster. Choose an individual session or a matching cluster.",
        );
      if (p && !p.approved)
        return setError(
          "The coach must approve this development plan before scheduling an intervention.",
        );
      save(
        {
          ...s,
          interventions: [
            ...s.interventions,
            {
              id,
              title: str("title"),
              clusterId: str("clusterId"),
              planId: str("planId"),
              date: str("date"),
              time: str("time"),
              coach: str("coach"),
              duration: num("duration"),
              status: "Scheduled",
              notes: str("notes"),
            },
          ],
        },
        "Intervention scheduled",
      );
    }
    if (modal === "measurement") {
      save(
        {
          ...s,
          measurements: [
            ...s.measurements,
            {
              id,
              planId: str("planId"),
              value: num("value"),
              date: str("date"),
              notes: str("notes"),
            },
          ],
        },
        "Measurement saved. Progress and passport updated.",
      );
    }
    if (modal === "session") {
      save(
        {
          ...s,
          interventions: s.interventions.map((i) =>
            i.id === sessionId
              ? { ...i, status: str("status"), notes: str("notes") }
              : i,
          ),
        },
        "Session status and observations saved",
      );
    }
  };
  const heading =
    role === "Player" && page === "Overview"
      ? "Your next chapter starts here."
      : {
          Overview: "A clearer path for every player.",
          Players: "Know the player. Grow the potential.",
          Assessments: "Start with understanding.",
          "Development plans": "Individual goals. Meaningful growth.",
          "Development clusters": "Shared needs. Individual journeys.",
          Interventions: "Turn a plan into practice.",
          "Progress & reports": "Make development visible.",
          "Player passport": "One player. Their whole journey.",
        }[page];
  const action: Record<Page, [string, Modal]> = {
    Overview: ["New assessment", "assessment"],
    Players: ["Add player", "player"],
    Assessments: ["New assessment", "assessment"],
    "Development plans": ["Create development plan", "plan"],
    "Development clusters": ["Create cluster", "cluster"],
    Interventions: ["Schedule intervention", "intervention"],
    "Progress & reports": ["Record measurement", "measurement"],
    "Player passport": ["Record assessment", "assessment"],
  };
  const relatedPlans = s.plans.filter((p) => p.playerId === player.id);
  const session = s.interventions.find((i) => i.id === sessionId);
  const editPlan = s.plans.find((p) => p.id === edit);
  function field(
    label: string,
    name: string,
    type = "text",
    value: string | number = "",
    extra: Record<string, unknown> = {},
  ) {
    return (
      <label className="field">
        {label}
        <input
          name={name}
          type={type}
          defaultValue={value}
          required
          {...extra}
        />
      </label>
    );
  }
  function playerSelect(value = selected) {
    return (
      <label className="field">
        Player
        <select
          name="playerId"
          defaultValue={value}
          onChange={(e) => setFormPlayer(e.target.value)}
        >
          {s.players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function focusSelect(value = "First touch") {
    return (
      <label className="field">
        Development focus
        <select name="focus" defaultValue={value}>
          {focuses.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </label>
    );
  }
  function planSelect() {
    return (
      <label className="field">
        Linked development plan
        <select name="planId" defaultValue={edit || relatedPlans[0]?.id}>
          {s.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {s.players.find((x) => x.id === p.playerId)?.name}: {p.title}
              {!p.approved ? " (awaiting approval)" : ""}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function notes(value = "", label = "Coach observations") {
    return (
      <label className="field full">
        {label}
        <textarea
          name="notes"
          defaultValue={value}
          rows={3}
          placeholder="Add context that helps the next session..."
        />
      </label>
    );
  }
  function PlanCard({ p }: { p: Plan }) {
    const owner = s.players.find((x) => x.id === p.playerId)!;
    return (
      <article className="card plan-card">
        <div className="split">
          <Badge tone={p.approved ? "green" : "amber"}>
            {p.approved ? "Coach approved" : "Awaiting approval"}
          </Badge>
          <button className="text-btn" onClick={() => open("plan", p.id)}>
            Edit <ArrowUpRight size={14} />
          </button>
        </div>
        <h3>{p.title}</h3>
        <button className="person-link" onClick={() => viewPlayer(owner.id)}>
          <Avatar player={owner} />
          <span>
            {owner.name}
            <small>{p.focus}</small>
          </span>
        </button>
        <div className="plan-numbers">
          <div>
            <small>Baseline</small>
            <strong>{p.baseline}</strong>
          </div>
          <ArrowRight size={17} />
          <div>
            <small>Current</small>
            <strong>{latest(s, p)}</strong>
          </div>
          <ArrowRight size={17} />
          <div>
            <small>Target</small>
            <strong>{p.target}</strong>
          </div>
        </div>
        <p className="muted tiny">{p.unit}</p>
        <div className="split tiny">
          <span>Goal progress</span>
          <b>{progress(s, p)}%</b>
        </div>
        <div className="progress">
          <span style={{ width: progress(s, p) + "%" }} />
        </div>
        <p className="plan-note">{p.notes}</p>
        <div className="split card-footer">
          <span>
            <Flag size={14} /> Due {formatDate(p.deadline)}
          </span>
          <button
            className="text-btn"
            onClick={() => open("measurement", p.id)}
          >
            Record progress <Plus size={14} />
          </button>
        </div>
      </article>
    );
  }
  function Sessions({ compact = false }: { compact?: boolean }) {
    const items = (compact ? squadSessions : s.interventions)
      .filter((i) => i.status === "Scheduled")
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    return (
      <div className="sessions">
        {items.slice(0, compact ? 3 : undefined).map((i) => (
          <button
            className="session"
            key={i.id}
            onClick={() => {
              setSessionId(i.id);
              open("session");
            }}
          >
            <span className="date-box">
              <b>{new Date(i.date + "T12:00:00").getDate()}</b>
              <small>
                {new Date(i.date + "T12:00:00")
                  .toLocaleDateString("en", { month: "short" })
                  .toUpperCase()}
              </small>
            </span>
            <span className="session-info">
              <strong>{i.title}</strong>
              <small>
                {i.time} · {i.duration} min · {i.coach}
              </small>
              <span className="tiny muted">
                {s.clusters.find((c) => c.id === i.clusterId)?.name ||
                  "Individual session"}
              </span>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
        {!items.length && (
          <p className="empty">
            All sessions complete. Schedule the next step.
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Overview");
          }}
        >
          <span className="brand-mark">
            <Leaf size={24} />
          </span>
          <span>
            TRAJECTORY<small>DEVELOPMENT, BY DESIGN</small>
          </span>
        </a>
        <div className="academy">
          <span className="academy-icon">
            <ShieldCheck size={24} />
          </span>
          <span>
            Roots Football Academy<small>Pune, Maharashtra</small>
          </span>
          <ChevronDown size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {pages.map((p, i) => {
            const Icon = icons[i];
            return (
              <button
                key={p}
                className={page === p ? "active" : ""}
                onClick={() => go(p)}
              >
                <Icon size={19} />
                <span>{p}</span>
                {p === "Players" && <small>{s.players.length}</small>}
                {page === p && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="cycle-mini">
            <span className="split">
              <b>One cycle. Lasting impact.</b>
              <Leaf size={15} />
            </span>
            <p>Build • Develop • Excel</p>
            <div className="mini-weeks">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className={i < 6 ? "done" : ""} />
              ))}
            </div>
            <small>Week 6 of your 12-week journey</small>
          </div>
          <button className="settings-btn" onClick={() => open("settings")}>
            <Settings size={18} /> Demo settings{" "}
            <span className="badge">DEMO</span>
          </button>
          <div className="coach">
            <span className="coach-avatar">VK</span>
            <span>
              Vikram Kulkarni<small>Head coach</small>
            </span>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      {mobile && (
        <div className="sidebar-overlay" onClick={() => setMobile(false)} />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <div className="role-switch">
              <button
                className={role === "Coach" ? "selected" : ""}
                onClick={() => setRole("Coach")}
              >
                Coach view
              </button>
              <button
                className={role === "Player" ? "selected" : ""}
                onClick={() => {
                  setRole("Player");
                  go("Player passport");
                  setSelected("p1");
                }}
              >
                Player view
              </button>
            </div>
            <button
              className="notification icon-btn"
              aria-label="Notifications"
              onClick={() => open("notifications")}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="coach-avatar small">VK</span>
          </div>
        </header>
        <main>
          <div className="page-intro">
            <div>
              <div className="eyebrow">
                {role === "Player"
                  ? "YOUR DEVELOPMENT COMPANION"
                  : "ROOTS FOOTBALL ACADEMY"}{" "}
                <span /> 2026/27 SEASON
              </div>
              <h1>{heading}</h1>
              <p>
                {page === "Overview"
                  ? `Good morning, ${role === "Coach" ? "Coach Vikram" : "Arjun"}. Let’s move potential into progress.`
                  : {
                      Players:
                        "Every profile is a starting point for something bigger.",
                      Assessments:
                        "Record observations. Understand strengths. Find the next focus.",
                      "Development plans":
                        "Coach-led plans built around each player’s next step.",
                      "Development clusters":
                        "Bring players together without losing sight of the individual.",
                      Interventions:
                        "Coordinate the people, practice and feedback that move players forward.",
                      "Progress & reports":
                        "Compare recorded measurements and keep the context behind the numbers.",
                      "Player passport":
                        "A living record of assessments, goals and the work in between.",
                    }[page]}
              </p>
            </div>
            <button
              className="btn primary"
              onClick={() => open(action[page][1])}
            >
              <Plus size={17} />
              {action[page][0]}
            </button>
          </div>
          {page === "Overview" && (
            <>
              <div className="overview-filters">
                <span className="muted tiny">Academy overview</span>
                <select
                  aria-label="Overview squad"
                  value={squad}
                  onChange={(e) => setSquad(e.target.value)}
                >
                  <option>All squads</option>
                  <option>U16</option>
                  <option>U18</option>
                </select>
              </div>
              <div className="overview-grid">
                <section className="hero">
                  <img
                    src="/images/football.jpg"
                    alt="A youth football coach guiding a training group"
                  />
                  <div className="hero-shade" />
                  <div className="hero-content">
                    <Badge tone="hero-badge">
                      <span className="live-dot" /> CYCLE 02 · SEP TO DEC 2026
                    </Badge>
                    <h2>
                      Small steps.
                      <br />
                      Bigger game.
                    </h2>
                    <p>
                      The right support, at the right moment.
                      <br />
                      Give every player a way forward.
                    </p>
                    <button
                      className="btn cream"
                      onClick={() => go("Development plans")}
                    >
                      Explore development plans <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <span className="hero-caption">
                    <MapPin size={13} /> ROOTED IN GRASSROOTS. BUILT FOR GROWTH.
                  </span>
                </section>
                <section className="card cycle-card">
                  <div className="split">
                    <span className="eyebrow">THE 12-WEEK JOURNEY</span>
                    <Badge>In progress</Badge>
                  </div>
                  <div className="cycle-ring">
                    <svg viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="66" />
                      <circle className="ring-value" cx="80" cy="80" r="66" />
                    </svg>
                    <div>
                      <strong>
                        06<span>/ 12</span>
                      </strong>
                      <small>WEEKS INTO THE CYCLE</small>
                    </div>
                  </div>
                  <h3>Build. Develop. Excel.</h3>
                  <p>
                    The foundation is set.
                    <br />
                    Now, make the practice count.
                  </p>
                  <div className="cycle-phases">
                    <span>
                      <i className="complete" />
                      Assess
                    </span>
                    <span>
                      <i className="current" />
                      Develop
                    </span>
                    <span>
                      <i />
                      Review
                    </span>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => go("Progress & reports")}
                  >
                    View cycle progress <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <div className="metric-grid">
                {[
                  {
                    label: "Players in development",
                    value: visible.length,
                    note:
                      "Across " +
                      new Set(visible.map((p) => p.squad)).size +
                      (new Set(visible.map((p) => p.squad)).size === 1
                        ? " age group"
                        : " age groups"),
                    icon: Users,
                    color: "green",
                  },
                  {
                    label: "Players assessed",
                    value: assessed.size,
                    note:
                      Math.round(
                        (assessed.size / (visible.length || 1)) * 100,
                      ) + "% of selected squad",
                    icon: ClipboardCheck,
                    color: "purple",
                  },
                  {
                    label: "Approved development plans",
                    value: approved.length,
                    note:
                      plans.filter((p) => !p.approved).length +
                      " awaiting your review",
                    icon: Target,
                    color: "orange",
                  },
                  {
                    label: "Sessions completed",
                    value: squadSessions.filter((i) => i.status === "Completed")
                      .length,
                    note:
                      squadSessions.filter((i) => i.status === "Scheduled")
                        .length +
                      (squadSessions.filter((i) => i.status === "Scheduled")
                        .length === 1
                        ? " session coming up"
                        : " sessions coming up"),
                    icon: CalendarDays,
                    color: "blue",
                  },
                ].map((m) => (
                  <section className="card metric" key={m.label}>
                    <span className={`metric-icon ${m.color}`}>
                      <m.icon size={22} />
                    </span>
                    <span className="metric-value">
                      {m.value.toString().padStart(2, "0")}
                    </span>
                    <h3>{m.label}</h3>
                    <small>{m.note}</small>
                  </section>
                ))}
              </div>
              <div className="content-grid">
                <section className="card">
                  <div className="section-header">
                    <div>
                      <h2>Your squad, at a glance</h2>
                      <p>Individual journeys. One shared ambition.</p>
                    </div>
                    <button className="text-btn" onClick={() => go("Players")}>
                      All players <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>PLAYER</th>
                          <th>DEVELOPMENT FOCUS</th>
                          <th>PLAN STATUS</th>
                          <th>PROGRESS</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {visible.slice(0, 5).map((p) => {
                          const plan = s.plans.find((x) => x.playerId === p.id);
                          return (
                            <tr key={p.id} onClick={() => viewPlayer(p.id)}>
                              <td>
                                <span className="player-cell">
                                  <Avatar player={p} />
                                  <span>
                                    <b>{p.name}</b>
                                    <small>
                                      {p.squad} · {p.position}
                                    </small>
                                  </span>
                                </span>
                              </td>
                              <td>{plan?.focus || "Baseline review"}</td>
                              <td>
                                <Badge
                                  tone={
                                    plan
                                      ? plan.approved
                                        ? "green"
                                        : "amber"
                                      : "gray"
                                  }
                                >
                                  {plan
                                    ? plan.approved
                                      ? "On track"
                                      : "Needs review"
                                    : "Not started"}
                                </Badge>
                              </td>
                              <td>
                                <span className="table-progress">
                                  <span className="progress">
                                    <span
                                      style={{
                                        width:
                                          (plan ? progress(s, plan) : 0) + "%",
                                      }}
                                    />
                                  </span>
                                  <b>{plan ? progress(s, plan) : 0}%</b>
                                </span>
                              </td>
                              <td>
                                <button
                                  className="icon-btn"
                                  aria-label={`View ${p.name}`}
                                >
                                  <ArrowUpRight size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
                <section className="card">
                  <div className="section-header">
                    <div>
                      <h2>Coming up next</h2>
                      <p>Make every session matter.</p>
                    </div>
                    <button
                      className="icon-btn"
                      aria-label="View all interventions"
                      onClick={() => go("Interventions")}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <Sessions compact />
                  <div className="inset-note">
                    <span className="metric-icon green">
                      <Footprints size={19} />
                    </span>
                    <p>
                      <b>Coach-led. Player-centred.</b>
                      <small>Technology organises. You make the calls.</small>
                    </p>
                  </div>
                </section>
              </div>
              <div className="content-grid bottom-grid">
                <section className="card pathway">
                  <div className="section-header">
                    <div>
                      <h2>From assessment to achievement</h2>
                      <p>
                        A connected development pathway, every step of the way.
                      </p>
                    </div>
                  </div>
                  <div className="pathway-steps">
                    {[
                      {
                        title: "Assess",
                        text: "Understand the player",
                        page: "Assessments",
                        icon: ClipboardCheck,
                      },
                      {
                        title: "Plan",
                        text: "Give growth a direction",
                        page: "Development plans",
                        icon: Target,
                      },
                      {
                        title: "Develop",
                        text: "Practice with purpose",
                        page: "Interventions",
                        icon: Footprints,
                      },
                      {
                        title: "Track",
                        text: "See the journey unfold",
                        page: "Player passport",
                        icon: TrendingUp,
                      },
                    ].map((x, i) => (
                      <React.Fragment key={x.title}>
                        <button onClick={() => go(x.page as Page)}>
                          <span>
                            <x.icon size={21} />
                          </span>
                          <b>{x.title}</b>
                          <small>{x.text}</small>
                        </button>
                        {i < 3 && <ChevronRight size={17} />}
                      </React.Fragment>
                    ))}
                  </div>
                </section>
                <section className="focus-banner">
                  <div>
                    <span className="eyebrow">THIS CYCLE'S SHARED FOCUS</span>
                    <h2>Better together.</h2>
                    <p>
                      {s.clusters.length} development clusters.
                      <br />
                      One individual plan at a time.
                    </p>
                    <button
                      className="text-btn"
                      onClick={() => go("Development clusters")}
                    >
                      Explore clusters <ArrowRight size={15} />
                    </button>
                  </div>
                  <Pitch />
                </section>
              </div>
            </>
          )}
          {page === "Players" && (
            <>
              <div className="toolbar">
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Search players"
                    placeholder="Search by name or position..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filter squad"
                  value={squad}
                  onChange={(e) => setSquad(e.target.value)}
                >
                  <option>All squads</option>
                  <option>U16</option>
                  <option>U18</option>
                </select>
                <span className="muted tiny">{visible.length} players</span>
              </div>
              <div className="player-grid">
                {visible.map((p) => {
                  const plan = s.plans.find((x) => x.playerId === p.id);
                  return (
                    <article className="card player-card" key={p.id}>
                      <div className="split">
                        <Badge tone="gray">{p.squad} SQUAD</Badge>
                        <span className="jersey">
                          #{p.number.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <Avatar player={p} large />
                      <h2>{p.name}</h2>
                      <p>
                        {p.position} · {p.age} years
                      </p>
                      <div className="player-stats">
                        <span>
                          <b>{score(p.id) ?? "N/A"}</b>
                          <small>Coach rating</small>
                        </span>
                        <span>
                          <b>
                            {
                              s.assessments.filter((a) => a.playerId === p.id)
                                .length
                            }
                          </b>
                          <small>Assessments</small>
                        </span>
                        <span>
                          <b>
                            {s.plans.filter((a) => a.playerId === p.id).length}
                          </b>
                          <small>Development plans</small>
                        </span>
                      </div>
                      <div className="player-focus">
                        <small>DEVELOPMENT FOCUS</small>
                        <strong>
                          {plan?.focus || "Ready for a first plan"}
                        </strong>
                      </div>
                      <button
                        className="btn secondary full"
                        onClick={() => viewPlayer(p.id)}
                      >
                        Open player passport <ArrowUpRight size={16} />
                      </button>
                    </article>
                  );
                })}
              </div>
              {!visible.length && (
                <div className="card empty">No players match your search.</div>
              )}
            </>
          )}
          {page === "Assessments" && (
            <>
              <div className="info-strip">
                <ShieldCheck size={21} />
                <span>
                  <b>Observations with a purpose.</b> Scores use a coach-defined
                  0 to 100 rubric. They support decisions and are not validated
                  scouting ratings.
                </span>
              </div>
              <section className="card">
                <div className="section-header">
                  <div>
                    <h2>Assessment history</h2>
                    <p>
                      Technical, physical, tactical and psychological
                      development.
                    </p>
                  </div>
                  <label className="search compact">
                    <Search size={17} />
                    <input
                      aria-label="Search assessments"
                      placeholder="Find a player..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PLAYER / DATE</th>
                        <th>TECHNICAL</th>
                        <th>PHYSICAL</th>
                        <th>TACTICAL</th>
                        <th>PSYCHOLOGICAL</th>
                        <th>COACH OBSERVATIONS</th>
                        <th>NEXT STEP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...s.assessments]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .filter((a) =>
                          s.players
                            .find((p) => p.id === a.playerId)
                            ?.name.toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((a) => {
                          const p = s.players.find((p) => p.id === a.playerId)!;
                          return (
                            <tr key={a.id}>
                              <td>
                                <button
                                  className="person-link"
                                  onClick={() => viewPlayer(p.id)}
                                >
                                  <Avatar player={p} />
                                  <span>
                                    <b>{p.name}</b>
                                    <small>{formatDate(a.date)}</small>
                                  </span>
                                </button>
                              </td>
                              {[
                                a.technical,
                                a.physical,
                                a.tactical,
                                a.psychological,
                              ].map((v, i) => (
                                <td key={i}>
                                  <span
                                    className={`score ${v < 65 ? "low" : ""}`}
                                  >
                                    {v}
                                    <small>/100</small>
                                  </span>
                                </td>
                              ))}
                              <td className="observation">
                                {a.notes || "No observations recorded"}
                              </td>
                              <td>
                                <button
                                  className="text-btn"
                                  onClick={() => {
                                    setSelected(p.id);
                                    setFormPlayer(p.id);
                                    setEdit("");
                                    setModal("plan");
                                  }}
                                >
                                  Create plan <ArrowUpRight size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          {page === "Development plans" && (
            <>
              <div className="info-strip">
                <Target size={21} />
                <span>
                  <b>Individual by design.</b> Baselines and targets use the
                  same measurement protocol. Plans require a coach's approval
                  before delivery.
                </span>
              </div>
              <div className="toolbar">
                <label className="search">
                  <Search size={18} />
                  <input
                    aria-label="Search plans"
                    placeholder="Search plans or players..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <Badge>
                  {s.plans.filter((p) => p.approved).length} approved plans
                </Badge>
              </div>
              <div className="three-grid">
                {s.plans
                  .filter((p) =>
                    `${p.title} ${s.players.find((x) => x.id === p.playerId)?.name}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <PlanCard key={p.id} p={p} />
                  ))}
              </div>
            </>
          )}
          {page === "Development clusters" && (
            <>
              <div className="info-strip">
                <Layers size={21} />
                <span>
                  <b>Group the need, keep the individual.</b> Each cluster
                  shares a practice focus. Player-specific targets stay in
                  individual development plans.
                </span>
              </div>
              <div className="three-grid">
                {s.clusters.map((c, i) => (
                  <article className="card cluster-card" key={c.id}>
                    <div className="cluster-visual">
                      <Pitch />
                      <span className="cluster-number">0{i + 1}</span>
                      <Badge tone="hero-badge">{c.focus}</Badge>
                    </div>
                    <div className="cluster-body">
                      <h2>{c.name}</h2>
                      <p>
                        {c.coach} · {c.playerIds.length} players
                      </p>
                      <div className="cluster-people">
                        {c.playerIds.map((id) => {
                          const p = s.players.find((p) => p.id === id)!;
                          return (
                            <button
                              key={id}
                              className="person-link"
                              onClick={() => viewPlayer(id)}
                            >
                              <Avatar player={p} />
                              <span>
                                {p.name}
                                <small>
                                  {s.plans.find(
                                    (p) =>
                                      p.playerId === id && p.focus === c.focus,
                                  )?.title || "Individual goal to be defined"}
                                </small>
                              </span>
                              <ArrowUpRight size={14} />
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className="btn secondary full"
                        onClick={() => {
                          setEdit("");
                          open("intervention", c.id);
                        }}
                      >
                        Schedule a session <Plus size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {page === "Interventions" && (
            <div className="content-grid">
              <section className="card">
                <div className="section-header">
                  <div>
                    <h2>Training schedule</h2>
                    <p>
                      Open a session to update status and capture observations.
                    </p>
                  </div>
                  <Badge>
                    {
                      s.interventions.filter((i) => i.status === "Scheduled")
                        .length
                    }{" "}
                    scheduled
                  </Badge>
                </div>
                <Sessions />
              </section>
              <section className="card">
                <div className="section-header">
                  <div>
                    <h2>Delivered & reflected</h2>
                    <p>The work behind the progress.</p>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
                {s.interventions
                  .filter((i) => i.status === "Completed")
                  .map((i) => (
                    <button
                      className="completed-session"
                      key={i.id}
                      onClick={() => {
                        setSessionId(i.id);
                        open("session");
                      }}
                    >
                      <Badge>Completed · {formatDate(i.date)}</Badge>
                      <h3>{i.title}</h3>
                      <p>{i.notes || "Add observations from this session."}</p>
                      <span>
                        {i.coach} <ArrowUpRight size={14} />
                      </span>
                    </button>
                  ))}
                {s.interventions
                  .filter((i) => i.status === "Cancelled")
                  .map((i) => (
                    <button
                      className="completed-session"
                      key={i.id}
                      onClick={() => {
                        setSessionId(i.id);
                        open("session");
                      }}
                    >
                      <Badge tone="gray">
                        Cancelled · {formatDate(i.date)}
                      </Badge>
                      <h3>{i.title}</h3>
                      <p>{i.notes}</p>
                    </button>
                  ))}
                {!s.interventions.some((i) => i.status === "Completed") && (
                  <p className="empty">
                    Completed sessions and coach reflections will appear here.
                  </p>
                )}
              </section>
            </div>
          )}
          {page === "Progress & reports" && (
            <>
              <div className="split report-top">
                <div className="info-strip">
                  <ChartNoAxesCombined size={22} />
                  <span>
                    <b>Measured progress, with context.</b> Based only on saved
                    observations. Changes do not establish that the programme
                    caused improvement.
                  </span>
                </div>
                <button className="btn secondary" onClick={exportData}>
                  <Download size={16} /> Export records
                </button>
              </div>
              <div className="metric-grid">
                <section className="card metric">
                  <small>PLAYERS WITH MEASUREMENTS</small>
                  <strong className="metric-value">
                    {
                      new Set(
                        s.measurements.map(
                          (m) =>
                            s.plans.find((p) => p.id === m.planId)?.playerId,
                        ),
                      ).size
                    }
                  </strong>
                  <h3>Journeys being tracked</h3>
                </section>
                <section className="card metric">
                  <small>RECORDED CHECK-INS</small>
                  <strong className="metric-value">
                    {s.measurements.length}
                  </strong>
                  <h3>Individual measurements</h3>
                </section>
                <section className="card metric">
                  <small>AVERAGE GOAL PROGRESS</small>
                  <strong className="metric-value">
                    {avg(s.plans.map((p) => progress(s, p)))}
                    <em>%</em>
                  </strong>
                  <h3>Toward individual targets</h3>
                </section>
                <section className="card metric">
                  <small>TARGETS REACHED</small>
                  <strong className="metric-value">
                    {s.plans.filter((p) => progress(s, p) >= 100).length}
                  </strong>
                  <h3>Milestones to celebrate</h3>
                </section>
              </div>
              <div className="two-grid">
                {s.plans.map((p) => (
                  <section className="card report-card" key={p.id}>
                    <div className="split">
                      <div>
                        <span className="eyebrow">
                          {s.players.find((x) => x.id === p.playerId)?.name}
                        </span>
                        <h2>{p.title}</h2>
                        <p className="muted tiny">
                          {p.unit} · target {p.target}
                        </p>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label={`Record ${p.title}`}
                        onClick={() => open("measurement", p.id)}
                      >
                        <Plus size={19} />
                      </button>
                    </div>
                    <Trend s={s} plan={p} />
                    <div className="measurement-list">
                      <div>
                        <b>Baseline</b>
                        <span>{p.baseline}</span>
                      </div>
                      {s.measurements
                        .filter((m) => m.planId === p.id)
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((m) => (
                          <div key={m.id}>
                            <span>
                              {formatDate(m.date)} <small>{m.notes}</small>
                            </span>
                            <b>{m.value}</b>
                          </div>
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
          {page === "Player passport" && (
            <>
              <div className="toolbar">
                <label className="field passport-select">
                  Player passport
                  <select
                    aria-label="Select passport player"
                    value={player.id}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setPassportTab("Overview");
                    }}
                  >
                    {s.players.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="btn secondary"
                  onClick={() => window.print()}
                >
                  <Download size={16} /> Print passport
                </button>
                <Badge tone="gray">{player.tier} · proposed cycle tier</Badge>
              </div>
              <section className="passport-hero">
                <div className="passport-identity">
                  <Avatar player={player} large />
                  <div>
                    <div className="eyebrow">
                      ROOTS FOOTBALL ACADEMY · PLAYER PASSPORT
                    </div>
                    <h2>{player.name}</h2>
                    <p>
                      #{player.number} · {player.position} · {player.age} years
                      · {player.squad}
                    </p>
                    <Badge tone="hero-badge">
                      <ShieldCheck size={12} /> Coach-maintained record
                    </Badge>
                  </div>
                </div>
                <div className="passport-rating">
                  <span>{score(player.id) ?? "N/A"}</span>
                  <small>COACH RATING / 100</small>
                  <p>Latest recorded assessment</p>
                </div>
                <Pitch />
              </section>
              <div className="tabs">
                {[
                  "Overview",
                  "Assessments",
                  "Development plans",
                  "Interventions",
                  "Milestones",
                ].map((t) => (
                  <button
                    className={passportTab === t ? "active" : ""}
                    key={t}
                    onClick={() => setPassportTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {(passportTab === "Overview" ||
                passportTab === "Assessments") && (
                <section className="card passport-attributes">
                  <div className="section-header">
                    <div>
                      <h2>Development snapshot</h2>
                      <p>Latest coach observations across four dimensions.</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => open("assessment")}
                    >
                      Add assessment <Plus size={14} />
                    </button>
                  </div>
                  <div className="attributes">
                    {["Technical", "Physical", "Tactical", "Psychological"].map(
                      (label, i) => {
                        const records = [...s.assessments]
                          .filter((a) => a.playerId === player.id)
                          .sort((a, b) => a.date.localeCompare(b.date));
                        const a = records.at(-1);
                        const k = [
                          "technical",
                          "physical",
                          "tactical",
                          "psychological",
                        ][i] as "technical";
                        const value = a?.[k] || 0;
                        const change =
                          records.length > 1 ? value - records[0][k] : 0;
                        return (
                          <div key={label}>
                            <small>{label}</small>
                            <strong>
                              {a ? value : "N/A"}
                              <span>/100</span>
                            </strong>
                            <div className="progress">
                              <span style={{ width: value + "%" }} />
                            </div>
                            <p>
                              {change > 0 ? "+" : ""}
                              {change} since baseline
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                  {passportTab === "Assessments" && (
                    <div className="timeline">
                      {[...s.assessments]
                        .filter((a) => a.playerId === player.id)
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((a) => (
                          <article key={a.id}>
                            <span className="timeline-dot" />
                            <small>{formatDate(a.date)}</small>
                            <h3>Coach assessment recorded</h3>
                            <p>{a.notes}</p>
                            <Badge tone="gray">
                              Technical {a.technical} · Physical {a.physical} ·
                              Tactical {a.tactical} · Psychological{" "}
                              {a.psychological}
                            </Badge>
                          </article>
                        ))}
                    </div>
                  )}
                </section>
              )}
              {(passportTab === "Overview" ||
                passportTab === "Development plans") && (
                <div className="passport-plans">
                  <div className="section-header">
                    <div>
                      <h2>Development, made personal</h2>
                      <p>
                        Where the player is today. Where they're working to go.
                      </p>
                    </div>
                    <button className="text-btn" onClick={() => open("plan")}>
                      Create plan <Plus size={15} />
                    </button>
                  </div>
                  <div className="three-grid">
                    {relatedPlans.map((p) => (
                      <PlanCard key={p.id} p={p} />
                    ))}
                    {!relatedPlans.length && (
                      <div className="card empty">
                        No development plan yet. Start with a coach assessment.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(passportTab === "Overview" ||
                passportTab === "Interventions" ||
                passportTab === "Milestones") && (
                <div className="two-grid passport-lower">
                  <section className="card">
                    <div className="section-header">
                      <div>
                        <h2>
                          {passportTab === "Milestones"
                            ? "Development milestones"
                            : "The journey so far"}
                        </h2>
                        <p>Every observation adds to the story.</p>
                      </div>
                      <Trophy size={20} />
                    </div>
                    <div className="timeline">
                      {[
                        ...s.measurements
                          .filter((m) =>
                            relatedPlans.some((p) => p.id === m.planId),
                          )
                          .map((m) => ({
                            id: m.id,
                            date: m.date,
                            title: `${s.plans.find((p) => p.id === m.planId)?.focus}: ${m.value} ${s.plans.find((p) => p.id === m.planId)?.unit}`,
                            notes: m.notes,
                          })),
                        ...s.assessments
                          .filter((a) => a.playerId === player.id)
                          .map((a) => ({
                            id: a.id,
                            date: a.date,
                            title: "Development assessment",
                            notes: a.notes,
                          })),
                      ]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((x) => (
                          <article key={x.id}>
                            <span className="timeline-dot" />
                            <small>{formatDate(x.date)}</small>
                            <h3>{x.title}</h3>
                            <p>{x.notes}</p>
                          </article>
                        ))}
                    </div>
                  </section>
                  <section className="card">
                    <div className="section-header">
                      <div>
                        <h2>Practice with purpose</h2>
                        <p>Sessions linked to this player's plan or cluster.</p>
                      </div>
                    </div>
                    {s.interventions
                      .filter(
                        (i) =>
                          relatedPlans.some((p) => p.id === i.planId) ||
                          s.clusters.some(
                            (c) =>
                              c.id === i.clusterId &&
                              c.playerIds.includes(player.id),
                          ),
                      )
                      .map((i) => (
                        <button
                          className="completed-session"
                          key={i.id}
                          onClick={() => {
                            setSessionId(i.id);
                            open("session");
                          }}
                        >
                          <Badge
                            tone={i.status === "Completed" ? "green" : "blue"}
                          >
                            {i.status} · {formatDate(i.date)}
                          </Badge>
                          <h3>{i.title}</h3>
                          <p>{i.notes}</p>
                        </button>
                      ))}
                  </section>
                </div>
              )}
            </>
          )}
          <footer>
            <span>
              <Leaf size={14} /> Every player, a way forward.
            </span>
            <span>
              Fictional demo data · Saved on this browser{" "}
              <span className="saved-dot" />
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">TRAJECTORY WORKSPACE</span>
                <h2 id="modal-title">
                  {
                    {
                      player: "Add a new player",
                      assessment: "Record an assessment",
                      plan: edit
                        ? "Edit development plan"
                        : "Create a development plan",
                      cluster: "Create a development cluster",
                      intervention: "Schedule an intervention",
                      measurement: "Record a measurement",
                      settings: "Demo settings",
                      notifications: "Your coaching desk",
                      session: "Session details",
                    }[modal]
                  }
                </h2>
              </div>
              <button
                className="icon-btn"
                aria-label="Close dialog"
                autoFocus
                onClick={() => setModal(null)}
              >
                <X size={21} />
              </button>
            </div>
            {modal === "settings" ? (
              <div className="settings-content">
                <div className="info-strip">
                  <ShieldCheck size={22} />
                  <span>
                    This is a local-first prototype. All records stay in this
                    browser. No account, paid API or bank details are needed.
                  </span>
                </div>
                <h3>Proposed 12-week cycle pricing</h3>
                <div className="pricing">
                  {[
                    ["Standard", "699"],
                    ["Premium", "999"],
                    ["Elite", "1,499"],
                  ].map(([tier, price]) => (
                    <div key={tier}>
                      <b>{tier}</b>
                      <strong>₹{price}</strong>
                      <small>per player / cycle</small>
                    </div>
                  ))}
                </div>
                <p className="muted tiny">
                  Illustrative business model, not established market rates. No
                  purchases or payments are available.
                </p>
                <button className="btn secondary full" onClick={exportData}>
                  <Download size={16} /> Export academy data
                </button>
                {resetConfirm ? (
                  <div className="reset-confirm" role="alert">
                    <h3>Restore the sample academy?</h3>
                    <p>
                      This replaces changes saved in this browser. Export your
                      records first if you want to keep them.
                    </p>
                    <div className="split">
                      <button
                        className="btn secondary"
                        onClick={() => setResetConfirm(false)}
                      >
                        Keep my changes
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => {
                          setSelected("p1");
                          setSquad("All squads");
                          setSearch("");
                          setPassportTab("Overview");
                          setResetConfirm(false);
                          save(structuredClone(initial), "Demo data restored");
                        }}
                      >
                        Restore sample academy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn danger full"
                    onClick={() => setResetConfirm(true)}
                  >
                    <RotateCcw size={16} /> Reset demo data
                  </button>
                )}
              </div>
            ) : modal === "notifications" ? (
              <div className="notifications-content">
                <div className="notice">
                  <Target size={22} />
                  <div>
                    <h3>
                      {s.plans.filter((p) => !p.approved).length} plan awaiting
                      review
                    </h3>
                    <p>
                      Coach approval keeps the development pathway accountable.
                    </p>
                    <button
                      className="text-btn"
                      onClick={() => {
                        setModal(null);
                        go("Development plans");
                      }}
                    >
                      Review development plans <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="notice">
                  <CalendarDays size={22} />
                  <div>
                    <h3>
                      {
                        s.interventions.filter((i) => i.status === "Scheduled")
                          .length
                      }{" "}
                      sessions scheduled
                    </h3>
                    <p>
                      Check the plan, prepare the practice, capture the
                      reflection.
                    </p>
                    <button
                      className="text-btn"
                      onClick={() => {
                        setModal(null);
                        go("Interventions");
                      }}
                    >
                      Open schedule <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={record}>
                <div className="form-grid">
                  {modal === "player" && (
                    <>
                      {field("Full name", "name", "text", "", {
                        maxLength: 70,
                      })}
                      {field("Age", "age", "number", 15, { min: 6, max: 21 })}
                      {field(
                        "Playing position",
                        "position",
                        "text",
                        "Right winger",
                      )}
                      {field("Shirt number", "number", "number", 12, {
                        min: 1,
                        max: 99,
                      })}
                      <label className="field">
                        Squad
                        <select name="squad">
                          <option>U16</option>
                          <option>U18</option>
                        </select>
                      </label>
                      <label className="field">
                        Proposed cycle tier
                        <select name="tier">
                          <option>Standard</option>
                          <option>Premium</option>
                          <option>Elite</option>
                        </select>
                      </label>
                    </>
                  )}
                  {modal === "assessment" && (
                    <>
                      {playerSelect()}
                      {field("Assessment date", "date", "date", today(), {
                        max: today(),
                      })}
                      <div className="form-hint full">
                        Use a consistent coach-defined rubric. 0 indicates the
                        beginning of development; 100 indicates consistent
                        execution for the age group.
                      </div>
                      {[
                        "technical",
                        "physical",
                        "tactical",
                        "psychological",
                      ].map((k) => (
                        <React.Fragment key={k}>
                          {field(
                            k[0].toUpperCase() + k.slice(1) + " / 100",
                            k,
                            "number",
                            70,
                            { min: 0, max: 100 },
                          )}
                        </React.Fragment>
                      ))}
                      {notes()}
                    </>
                  )}
                  {modal === "plan" && (
                    <>
                      {playerSelect(editPlan?.playerId)}
                      {focusSelect(editPlan?.focus)}
                      <div className="form-hint full">
                        Recent assessment:{" "}
                        {(() => {
                          const a = [...s.assessments]
                            .filter((a) => a.playerId === formPlayer)
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .at(-1);
                          return a
                            ? `${formatDate(a.date)}. Technical ${a.technical}, physical ${a.physical}, tactical ${a.tactical}, psychological ${a.psychological}. Lowest observation: ${
                                [
                                  ["technical", a.technical],
                                  ["physical", a.physical],
                                  ["tactical", a.tactical],
                                  ["psychological", a.psychological],
                                ].sort(
                                  (x, y) => Number(x[1]) - Number(y[1]),
                                )[0][0]
                              }. Coach review required; select a specific development focus below.`
                            : "No assessment recorded yet. Record a baseline before approving a plan.";
                        })()}
                      </div>
                      {field(
                        "Plan title",
                        "title",
                        "text",
                        editPlan?.title || "",
                      )}
                      {field(
                        "Deadline",
                        "deadline",
                        "date",
                        editPlan?.deadline || "2026-12-06",
                      )}
                      {field(
                        "Baseline",
                        "baseline",
                        "number",
                        editPlan?.baseline ?? 10,
                        { min: 0, step: "any" },
                      )}
                      {field(
                        "Target",
                        "target",
                        "number",
                        editPlan?.target ?? 20,
                        { min: 0, step: "any" },
                      )}
                      {field(
                        "Measurement protocol / unit",
                        "unit",
                        "text",
                        editPlan?.unit || "successful receives / 30",
                      )}
                      {notes(
                        editPlan?.notes,
                        "Planned interventions and coach rationale",
                      )}
                      <label className="checkbox full">
                        <input
                          type="checkbox"
                          name="approved"
                          defaultChecked={editPlan?.approved ?? false}
                        />{" "}
                        I have reviewed this player's assessment and approve
                        this plan.
                      </label>
                    </>
                  )}
                  {modal === "cluster" && (
                    <>
                      {field("Cluster name", "name")}
                      {focusSelect()}
                      {field("Assigned coach", "coach", "text", "Coach Vikram")}
                      <div className="field full">
                        Assign players
                        <div className="check-list">
                          {s.players.map((p) => (
                            <label className="checkbox" key={p.id}>
                              <input
                                type="checkbox"
                                name="playerIds"
                                value={p.id}
                              />
                              <Avatar player={p} />
                              <span>
                                {p.name}
                                <small>
                                  {s.plans.find((x) => x.playerId === p.id)
                                    ?.focus || "No plan yet"}
                                </small>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {modal === "intervention" && (
                    <>
                      {field("Session title", "title")}
                      {planSelect()}
                      <label className="field">
                        Development cluster
                        <select
                          name="clusterId"
                          defaultValue={
                            s.clusters.some((c) => c.id === edit) ? edit : ""
                          }
                        >
                          <option value="">Individual session</option>
                          {s.clusters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {field("Assigned coach", "coach", "text", "Coach Vikram")}
                      {field("Date", "date", "date", today())}
                      {field("Start time", "time", "time", "07:00")}
                      {field("Duration in minutes", "duration", "number", 45, {
                        min: 5,
                        max: 240,
                      })}
                      {notes("", "Session instructions")}
                    </>
                  )}
                  {modal === "measurement" && (
                    <>
                      {planSelect()}
                      {field("Measurement date", "date", "date", today(), {
                        max: today(),
                      })}
                      {field(
                        "Observed value in the plan’s unit",
                        "value",
                        "number",
                        "",
                        { min: 0, step: "any" },
                      )}
                      <div className="form-hint full">
                        Use the same protocol as the baseline. Saved
                        measurements update the plan, reports and player
                        passport.
                      </div>
                      {notes("", "Measurement context")}
                    </>
                  )}
                  {modal === "session" && session && (
                    <>
                      <div className="full session-summary">
                        <Badge tone="blue">{session.status}</Badge>
                        <h3>{session.title}</h3>
                        <p>
                          {formatDate(session.date)} · {session.time} ·{" "}
                          {session.duration} min · {session.coach}
                        </p>
                        <p>
                          Plan:{" "}
                          {s.plans.find((p) => p.id === session.planId)
                            ?.title || "No linked plan"}
                          <br />
                          Cluster:{" "}
                          {s.clusters.find((c) => c.id === session.clusterId)
                            ?.name || "Individual session"}
                        </p>
                      </div>
                      <label className="field full">
                        Session status
                        <select name="status" defaultValue={session.status}>
                          <option>Scheduled</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </label>
                      {notes(session.notes)}
                    </>
                  )}
                </div>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn primary" type="submit">
                    <Check size={16} />
                    {modal === "session"
                      ? "Save session"
                      : modal === "plan" && edit
                        ? "Save changes"
                        : "Save " +
                          ({
                            player: "player",
                            assessment: "assessment",
                            plan: "development plan",
                            cluster: "cluster",
                            intervention: "intervention",
                            measurement: "measurement",
                          }[modal] || "record")}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function Trend({ s, plan }: { s: Store; plan: Plan }) {
  const records = s.measurements
    .filter((m) => m.planId === plan.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const values = [plan.baseline, ...records.map((m) => m.value)];
  const max = Math.max(plan.target, ...values) * 1.15 || 1;
  const coords = values.map(
    (v, i) =>
      `${40 + i * (420 / Math.max(values.length - 1, 1))},${145 - (v / max) * 115}`,
  );
  return (
    <div className="trend">
      <svg
        viewBox="0 0 500 180"
        role="img"
        aria-label={`Recorded progress from ${plan.baseline} to ${latest(s, plan)}, target ${plan.target}`}
      >
        <defs>
          <linearGradient id={"fill" + plan.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#459b70" stopOpacity=".2" />
            <stop offset="100%" stopColor="#459b70" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="40"
            y1={30 + i * 38}
            x2="460"
            y2={30 + i * 38}
            stroke="#e8ede9"
          />
        ))}
        <line
          x1="40"
          x2="460"
          y1={145 - (plan.target / max) * 115}
          y2={145 - (plan.target / max) * 115}
          stroke="#bc944d"
          strokeDasharray="5 5"
        />
        <text
          x="460"
          y={138 - (plan.target / max) * 115}
          textAnchor="end"
          fill="#997a43"
          fontSize="10"
        >
          TARGET {plan.target}
        </text>
        <polygon
          points={`40,145 ${coords.join(" ")} ${40 + (values.length - 1) * (420 / Math.max(values.length - 1, 1))},145`}
          fill={`url(#fill${plan.id})`}
        />
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke="#32815b"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {coords.map((xy, i) => (
          <g key={i}>
            <circle
              cx={xy.split(",")[0]}
              cy={xy.split(",")[1]}
              r="4"
              fill="#fff"
              stroke="#32815b"
              strokeWidth="2"
            />
            <text
              x={xy.split(",")[0]}
              y={Number(xy.split(",")[1]) - 11}
              textAnchor="middle"
              fontSize="11"
              fill="#24593f"
            >
              {values[i]}
            </text>
            <text
              x={xy.split(",")[0]}
              y="170"
              textAnchor="middle"
              fontSize="10"
              fill="#7c887f"
            >
              {i === 0 ? "Baseline" : formatDate(records[i - 1].date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
