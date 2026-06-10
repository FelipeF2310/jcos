// Canonical CitiStat demo dataset.
//
// Every executive surface (Weekly Brief, Executive Exceptions, City Health)
// reads from this one source, so the numbers can never contradict each other.
// Rollups and counts are *derived* (see ./derive.ts) — never hand-typed — so
// the Brief's "7 declining" is literally the 7 cards on the Exceptions page.
//
// This lives in code rather than the database on purpose: it needs no migration
// or reseed of the live demo, and it is trivially portable into Postgres later.

export type Direction = "lower-better" | "higher-better";
export type MetricStatus = "on-target" | "at-risk" | "off-target";

// Three lenses for the City Health Overview — practical, not a vanity score.
export type Lens = "resident" | "operations" | "fiscal";

export const lensMeta: Record<Lens, { label: string; blurb: string }> = {
  resident: { label: "Resident Experience", blurb: "How residents experience city services" },
  operations: { label: "Operational Delivery", blurb: "Whether core services are delivered on time" },
  fiscal: { label: "Financial & Resource", blurb: "Budget, overtime, and asset pressure" },
};

export interface Department {
  id: string;
  name: string;
  director: string;
}

export const departments: Department[] = [
  { id: "public-works", name: "Public Works", director: "Director Johnson" },
  { id: "public-safety", name: "Public Safety", director: "Chief Alvarez" },
  { id: "engineering-permitting", name: "Engineering & Permitting", director: "Director Matos" },
  { id: "resident-response", name: "Resident Response Center", director: "Director Williams" },
  { id: "finance", name: "Finance & Administration", director: "Director Okafor" },
  { id: "housing", name: "Housing", director: "Director Bianchi" },
  { id: "health-human-services", name: "Health & Human Services", director: "Director Reyes" },
  { id: "recreation", name: "Recreation & Youth", director: "Director Coleman" },
];

export interface Metric {
  id: string;
  name: string;
  departmentId: string;
  lens: Lens;
  unit: string;
  value: number; // current period
  prior: number; // previous period — drives the headline change
  target: number;
  direction: Direction;
  status: MetricStatus;
  history: number[]; // ~6 weekly points, ending at `value` (for sparklines)
  whyItMatters: string;
  followUp: string; // suggested CitiStat follow-up question
  // True when an escalated operational issue is attached — elevates the
  // department to "intervention" even on a single red metric.
  escalated?: boolean;
}

export const metrics: Metric[] = [
  // ── Public Works ──────────────────────────────────────────────────────────
  {
    id: "graffiti-removal",
    name: "Graffiti Removal Time",
    departmentId: "public-works",
    lens: "operations",
    unit: "days",
    value: 1.8,
    prior: 2.2,
    target: 2.0,
    direction: "lower-better",
    status: "on-target",
    history: [2.8, 2.7, 2.5, 2.4, 2.2, 1.8],
    whyItMatters: "Visible blight is the single most common driver of resident perception of neighborhood decline.",
    followUp: "What changed in the abatement workflow, and can it be applied to illegal dumping?",
  },
  {
    id: "missed-trash",
    name: "Missed Trash Pickups",
    departmentId: "public-works",
    lens: "resident",
    unit: "reports/wk",
    value: 312,
    prior: 256,
    target: 200,
    direction: "lower-better",
    status: "off-target",
    history: [188, 205, 224, 248, 256, 312],
    whyItMatters: "A 22% jump may signal route coverage gaps, staffing shortfalls, or contractor performance issues.",
    followUp: "Which routes are driving the increase, and what corrective action is planned this week?",
  },
  {
    id: "pothole-response",
    name: "Pothole Response Time",
    departmentId: "public-works",
    lens: "operations",
    unit: "days",
    value: 4.2,
    prior: 4.0,
    target: 3.0,
    direction: "lower-better",
    status: "off-target",
    history: [3.4, 3.6, 3.7, 3.9, 4.0, 4.2],
    whyItMatters: "Sustained miss against the 3-day target; Ward F is averaging 6.1 days and generating formal complaints.",
    followUp: "Is the Ward F blitz holding the rest of the city's response time steady, or pulling crews off it?",
  },
  {
    id: "street-cleaning",
    name: "Street Cleaning Completion",
    departmentId: "public-works",
    lens: "operations",
    unit: "%",
    value: 88,
    prior: 84,
    target: 95,
    direction: "higher-better",
    status: "at-risk",
    history: [90, 88, 86, 85, 84, 88],
    whyItMatters: "Recovering, but three of eight sweepers remain out of service, capping achievable completion.",
    followUp: "When does the sweeper procurement close, and what is the completion ceiling until it does?",
  },

  // ── Public Safety ─────────────────────────────────────────────────────────
  {
    id: "ems-response",
    name: "EMS Response Time",
    departmentId: "public-safety",
    lens: "resident",
    unit: "min",
    value: 7.8,
    prior: 7.1,
    target: 7.0,
    direction: "lower-better",
    status: "off-target",
    history: [6.9, 7.0, 7.0, 7.1, 7.1, 7.8],
    whyItMatters: "Response time crossed the 7-minute clinical threshold this period — a direct public-safety risk.",
    followUp: "Is the increase concentrated in specific districts or shifts, and is it a staffing or dispatch issue?",
  },
  {
    id: "crime-clearance",
    name: "Part 1 Crime Clearance",
    departmentId: "public-safety",
    lens: "resident",
    unit: "%",
    value: 46,
    prior: 44,
    target: 42,
    direction: "higher-better",
    status: "on-target",
    history: [41, 42, 43, 43, 44, 46],
    whyItMatters: "Clearance above target supports the broader public-safety confidence narrative.",
    followUp: "Which investigative changes are driving this, and are they sustainable with current staffing?",
  },
  {
    id: "fire-inspection",
    name: "Fire Inspection Compliance",
    departmentId: "public-safety",
    lens: "operations",
    unit: "%",
    value: 91,
    prior: 89,
    target: 90,
    direction: "higher-better",
    status: "on-target",
    history: [87, 88, 88, 89, 89, 91],
    whyItMatters: "Back above the 90% compliance floor that reduces fire-loss liability exposure.",
    followUp: "Are multi-family properties keeping pace, or is the gain concentrated in commercial inspections?",
  },

  // ── Engineering & Permitting ──────────────────────────────────────────────
  {
    id: "permit-review",
    name: "Permit Review Time",
    departmentId: "engineering-permitting",
    lens: "fiscal",
    unit: "days",
    value: 21,
    prior: 19,
    target: 10,
    direction: "lower-better",
    status: "off-target",
    escalated: true,
    history: [13, 14, 16, 17, 19, 21],
    whyItMatters: "Doubled against target; construction starts are being deferred and developers have filed formal complaints.",
    followUp: "Will the temp-reviewer hires and the commercial/residential triage queue land before the June 15 roundtable?",
  },
  {
    id: "inspection-completion",
    name: "Inspection Completion",
    departmentId: "engineering-permitting",
    lens: "operations",
    unit: "%",
    value: 88,
    prior: 86,
    target: 95,
    direction: "higher-better",
    status: "at-risk",
    history: [89, 88, 87, 86, 86, 88],
    whyItMatters: "Inspection throughput compounds the permit backlog when it lags the 95% target.",
    followUp: "Can inspection scheduling be decoupled from plan review to stop the two backlogs reinforcing each other?",
  },

  // ── Resident Response Center (311) ────────────────────────────────────────
  {
    id: "sla-compliance",
    name: "311 SLA Compliance",
    departmentId: "resident-response",
    lens: "resident",
    unit: "%",
    value: 68,
    prior: 71,
    target: 85,
    direction: "higher-better",
    status: "off-target",
    history: [77, 75, 74, 72, 71, 68],
    whyItMatters: "Falling further below the 85% commitment; call volume is running 40% over staffed capacity.",
    followUp: "Has overflow routing stabilized SLA, and what is the timeline on the four-FTE budget amendment?",
  },
  {
    id: "resolution-time",
    name: "311 Avg Resolution Time",
    departmentId: "resident-response",
    lens: "resident",
    unit: "days",
    value: 2.8,
    prior: 3.1,
    target: 1.5,
    direction: "lower-better",
    status: "at-risk",
    history: [3.4, 3.3, 3.2, 3.1, 3.1, 2.8],
    whyItMatters: "Improving, but still nearly double target — and repeat complaints suggest first-contact resolution is weak.",
    followUp: "Are the 214 repeat-complaint addresses being routed differently to break the re-open cycle?",
  },

  // ── Finance & Administration ──────────────────────────────────────────────
  {
    id: "fleet-downtime",
    name: "Fleet Downtime",
    departmentId: "finance",
    lens: "operations",
    unit: "%",
    value: 19,
    prior: 16.5,
    target: 12,
    direction: "lower-better",
    status: "off-target",
    history: [13, 14, 15, 16, 16.5, 19],
    whyItMatters: "Rising downtime is the upstream cause of the sweeper and collection-vehicle shortfalls hitting Public Works.",
    followUp: "Is this deferred maintenance or parts-supply, and what is the cost of the emergency service contracts?",
  },
  {
    id: "overtime-budget",
    name: "Overtime vs Budget",
    departmentId: "finance",
    lens: "fiscal",
    unit: "% of budget",
    value: 108,
    prior: 105,
    target: 100,
    direction: "lower-better",
    status: "at-risk",
    history: [101, 102, 103, 104, 105, 108],
    whyItMatters: "Overtime is absorbing the staffing gaps in 311 and Public Works — a structural, not one-time, pressure.",
    followUp: "Which departments are driving the overrun, and does the FTE request offset it or add to it?",
  },
  {
    id: "tax-collection",
    name: "Tax Collection Rate",
    departmentId: "finance",
    lens: "fiscal",
    unit: "%",
    value: 96.4,
    prior: 96.1,
    target: 96.0,
    direction: "higher-better",
    status: "on-target",
    history: [95.7, 95.8, 96.0, 96.0, 96.1, 96.4],
    whyItMatters: "Steady collection underpins the fiscal-recovery plan and the FY26 cash position.",
    followUp: "Is the current-year rate strong enough to ease reliance on the tax-anticipation note?",
  },

  // ── Housing ───────────────────────────────────────────────────────────────
  {
    id: "affordable-units",
    name: "Affordable Units Delivered (YTD)",
    departmentId: "housing",
    lens: "fiscal",
    unit: "units",
    value: 240,
    prior: 205,
    target: 230,
    direction: "higher-better",
    status: "on-target",
    history: [150, 168, 185, 205, 222, 240],
    whyItMatters: "Tracking ahead of the annual commitment, a visible administration priority.",
    followUp: "Are the pipeline projects funded through close-out, or is delivery front-loaded?",
  },
  {
    id: "code-violations",
    name: "Housing Code Cases Resolved",
    departmentId: "housing",
    lens: "resident",
    unit: "%",
    value: 82,
    prior: 78,
    target: 80,
    direction: "higher-better",
    status: "on-target",
    history: [74, 76, 77, 78, 79, 82],
    whyItMatters: "Faster resolution reduces unsafe-housing exposure and the volume escalating to 311.",
    followUp: "Are emergency/no-heat cases being prioritized within the overall resolution rate?",
  },

  // ── Health & Human Services ───────────────────────────────────────────────
  {
    id: "clinic-wait",
    name: "Clinic Wait Time",
    departmentId: "health-human-services",
    lens: "resident",
    unit: "days",
    value: 6.5,
    prior: 8.0,
    target: 7.0,
    direction: "lower-better",
    status: "on-target",
    history: [9.5, 9.0, 8.5, 8.2, 8.0, 6.5],
    whyItMatters: "Back under target after the spring backlog — protects access for residents without private care.",
    followUp: "Did the added clinic hours create the gain, and is that staffing sustainable past the grant period?",
  },
  {
    id: "immunization-rate",
    name: "Childhood Immunization Rate",
    departmentId: "health-human-services",
    lens: "resident",
    unit: "%",
    value: 93,
    prior: 92,
    target: 90,
    direction: "higher-better",
    status: "on-target",
    history: [90, 91, 91, 92, 92, 93],
    whyItMatters: "Above the herd-immunity target ahead of the back-to-school surge.",
    followUp: "Are the lowest-coverage wards closing the gap, or is the citywide average masking pockets?",
  },

  // ── Recreation & Youth ────────────────────────────────────────────────────
  {
    id: "program-enrollment",
    name: "Summer Program Enrollment",
    departmentId: "recreation",
    lens: "resident",
    unit: "% capacity",
    value: 78,
    prior: 72,
    target: 75,
    direction: "higher-better",
    status: "on-target",
    history: [60, 64, 68, 72, 75, 78],
    whyItMatters: "Strong fill ahead of summer supports the youth-engagement and public-safety strategy.",
    followUp: "Is enrollment even across wards, or do transportation gaps leave some sites under capacity?",
  },
  {
    id: "field-availability",
    name: "Field & Facility Uptime",
    departmentId: "recreation",
    lens: "operations",
    unit: "%",
    value: 96,
    prior: 95,
    target: 95,
    direction: "higher-better",
    status: "on-target",
    history: [93, 94, 94, 95, 95, 96],
    whyItMatters: "Reliable facility access keeps summer programming on schedule.",
    followUp: "Are any closures concentrated at sites serving the highest-need neighborhoods?",
  },
];

// Curated, narrative — not every risk is a metric yet. Kept short on purpose.
export interface UpcomingRisk {
  title: string;
  department: string;
  horizon: string;
  note: string;
}

export const upcomingRisks: UpcomingRisk[] = [
  {
    title: "Sweeper fleet shortfall caps June street-cleaning",
    department: "Public Works",
    horizon: "This month",
    note: "Three of eight sweepers offline; completion is capped near 88% until emergency service contracts close.",
  },
  {
    title: "Developer roundtable lands before permit fix",
    department: "Engineering & Permitting",
    horizon: "June 15",
    note: "Temp reviewers and the triage queue must be live or the BA's commitment to developers slips publicly.",
  },
  {
    title: "Overtime overrun hardens into structural cost",
    department: "Finance",
    horizon: "FY26 close",
    note: "311 and DPW gaps are being filled with overtime; without the FTE amendment this carries into next year.",
  },
];
