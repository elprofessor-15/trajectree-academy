export type Player = {
  id: string;
  name: string;
  age: number;
  position: string;
  squad: string;
  number: number;
  tier: string;
};
export type Assessment = {
  id: string;
  playerId: string;
  date: string;
  technical: number;
  physical: number;
  tactical: number;
  psychological: number;
  notes: string;
};
export type Plan = {
  id: string;
  playerId: string;
  title: string;
  focus: string;
  baseline: number;
  target: number;
  unit: string;
  deadline: string;
  notes: string;
  approved: boolean;
};
export type Cluster = {
  id: string;
  name: string;
  focus: string;
  coach: string;
  playerIds: string[];
};
export type Intervention = {
  id: string;
  title: string;
  clusterId: string;
  planId: string;
  date: string;
  time: string;
  coach: string;
  duration: number;
  status: string;
  notes: string;
};
export type Measurement = {
  id: string;
  planId: string;
  value: number;
  date: string;
  notes: string;
};
export type Store = {
  players: Player[];
  assessments: Assessment[];
  plans: Plan[];
  clusters: Cluster[];
  interventions: Intervention[];
  measurements: Measurement[];
};
export const uid = () => crypto.randomUUID();
export const today = () => new Date().toLocaleDateString("en-CA");
export const initial: Store = {
  players: [
    {
      id: "p1",
      name: "Arjun Mehta",
      age: 15,
      position: "Right winger",
      squad: "U16",
      number: 10,
      tier: "Premium",
    },
    {
      id: "p2",
      name: "Rohan Singh",
      age: 15,
      position: "Central midfielder",
      squad: "U16",
      number: 8,
      tier: "Standard",
    },
    {
      id: "p3",
      name: "Kabir Thapa",
      age: 14,
      position: "Striker",
      squad: "U16",
      number: 9,
      tier: "Elite",
    },
    {
      id: "p4",
      name: "Ishaan Roy",
      age: 16,
      position: "Centre back",
      squad: "U18",
      number: 4,
      tier: "Premium",
    },
    {
      id: "p5",
      name: "Vivaan Kapoor",
      age: 15,
      position: "Left winger",
      squad: "U16",
      number: 11,
      tier: "Standard",
    },
    {
      id: "p6",
      name: "Ayaan Fernandes",
      age: 16,
      position: "Goalkeeper",
      squad: "U18",
      number: 1,
      tier: "Elite",
    },
    {
      id: "p7",
      name: "Dev Patel",
      age: 14,
      position: "Full back",
      squad: "U16",
      number: 3,
      tier: "Standard",
    },
    {
      id: "p8",
      name: "Aditya Nair",
      age: 17,
      position: "Central midfielder",
      squad: "U18",
      number: 6,
      tier: "Premium",
    },
  ],
  assessments: [
    ...["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map((playerId, i) => ({
      id: `a${i}`,
      playerId,
      date: "2026-09-14",
      technical: 57 + i * 2,
      physical: 65 + i,
      tactical: 60 + i,
      psychological: 70 + i,
      notes: "Cycle baseline. Coach-observed scores on a 0 to 100 rubric.",
    })),
    ...["p1", "p2", "p3", "p4", "p5", "p6"].map((playerId, i) => ({
      id: `a1${i}`,
      playerId,
      date: "2026-10-19",
      technical: 72 + i,
      physical: 72 + i,
      tactical: 70 + i,
      psychological: 78 + i,
      notes: "Mid-cycle review. Better consistency in small-sided games.",
    })),
  ],
  plans: [
    {
      id: "id1",
      playerId: "p1",
      title: "Receive with purpose",
      focus: "First touch",
      baseline: 12,
      target: 24,
      unit: "successful receives / 30",
      deadline: "2026-12-06",
      notes:
        "Open body shape before receiving. Two weekly wall-pass blocks and a coached receiving circuit.",
      approved: true,
    },
    {
      id: "id2",
      playerId: "p2",
      title: "See the next pass",
      focus: "Scanning",
      baseline: 8,
      target: 20,
      unit: "scans / 10 minutes",
      deadline: "2026-12-06",
      notes: "Shoulder checks before receiving in a 4v2 rondo.",
      approved: true,
    },
    {
      id: "id3",
      playerId: "p3",
      title: "Finish with composure",
      focus: "Finishing",
      baseline: 6,
      target: 16,
      unit: "shots on target / 20",
      deadline: "2026-12-06",
      notes: "Alternate feet and use a controlled approach.",
      approved: true,
    },
    {
      id: "id4",
      playerId: "p5",
      title: "A cleaner first touch",
      focus: "First touch",
      baseline: 10,
      target: 22,
      unit: "successful receives / 30",
      deadline: "2026-12-06",
      notes: "Receive across the body and into space.",
      approved: true,
    },
    {
      id: "id5",
      playerId: "p4",
      title: "Build from the back",
      focus: "Passing",
      baseline: 14,
      target: 25,
      unit: "completed passes / 30",
      deadline: "2026-12-06",
      notes: "Progress through the first line under pressure.",
      approved: false,
    },
  ],
  clusters: [
    {
      id: "c1",
      name: "First-touch builders",
      focus: "First touch",
      coach: "Coach Vikram",
      playerIds: ["p1", "p5", "p7"],
    },
    {
      id: "c2",
      name: "Game readers",
      focus: "Scanning",
      coach: "Coach Neha",
      playerIds: ["p2", "p4", "p8"],
    },
    {
      id: "c3",
      name: "Final-third finishers",
      focus: "Finishing",
      coach: "Coach Vikram",
      playerIds: ["p3"],
    },
  ],
  interventions: [
    {
      id: "i1",
      title: "Receiving circuit & wall passes",
      clusterId: "c1",
      planId: "id1",
      date: "2026-10-24",
      time: "07:00",
      coach: "Coach Vikram",
      duration: 45,
      status: "Scheduled",
      notes: "Pitch A. Bring cones and two balls per player.",
    },
    {
      id: "i2",
      title: "Scan, receive, play",
      clusterId: "c2",
      planId: "id2",
      date: "2026-10-25",
      time: "16:30",
      coach: "Coach Neha",
      duration: 40,
      status: "Scheduled",
      notes: "4v2 rondos with coloured gates.",
    },
    {
      id: "i3",
      title: "Finishing under pressure",
      clusterId: "c3",
      planId: "id3",
      date: "2026-10-26",
      time: "07:30",
      coach: "Coach Vikram",
      duration: 50,
      status: "Scheduled",
      notes: "Pitch B. Rotate the supporting player.",
    },
    {
      id: "i4",
      title: "First-touch foundation",
      clusterId: "c1",
      planId: "id1",
      date: "2026-10-19",
      time: "07:00",
      coach: "Coach Vikram",
      duration: 45,
      status: "Completed",
      notes:
        "Arjun opened his body more consistently. Repeat with passive pressure.",
    },
  ],
  measurements: [
    {
      id: "m1",
      planId: "id1",
      date: "2026-09-28",
      value: 15,
      notes: "Unopposed circuit.",
    },
    {
      id: "m2",
      planId: "id1",
      date: "2026-10-12",
      value: 18,
      notes: "Passive pressure.",
    },
    {
      id: "m3",
      planId: "id1",
      date: "2026-10-19",
      value: 20,
      notes: "Same 30-receive protocol.",
    },
    {
      id: "m4",
      planId: "id2",
      date: "2026-10-19",
      value: 15,
      notes: "10-minute game observation.",
    },
    {
      id: "m5",
      planId: "id3",
      date: "2026-10-19",
      value: 11,
      notes: "20-shot protocol.",
    },
    {
      id: "m6",
      planId: "id4",
      date: "2026-10-19",
      value: 16,
      notes: "30-receive protocol.",
    },
  ],
};
export function load(): Store {
  try {
    const raw = localStorage.getItem("trajectory-v1");
    if (raw) {
      const s = JSON.parse(raw);
      if (
        [
          "players",
          "assessments",
          "plans",
          "clusters",
          "interventions",
          "measurements",
        ].every((k) => Array.isArray(s[k]))
      )
        return s;
    }
  } catch {}
  return structuredClone(initial);
}
export function latest(s: Store, plan: Plan) {
  return (
    [...s.measurements]
      .filter((m) => m.planId === plan.id)
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1)?.value ?? plan.baseline
  );
}
export function progress(s: Store, plan: Plan) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((latest(s, plan) - plan.baseline) / (plan.target - plan.baseline)) *
          100,
      ),
    ),
  );
}
export const formatDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
