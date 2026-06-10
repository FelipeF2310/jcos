import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { departments, metrics, issues, actions, metricReadings, issueComments, performanceReviews, reviewIssues } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

function weeksAgo(n: number) {
  const d = new Date("2026-06-09");
  d.setDate(d.getDate() - n * 7);
  return d;
}

function weekLabel(n: number) {
  const d = weeksAgo(n);
  return `2026-W${String(Math.ceil((d.getDate()) / 7) + (d.getMonth() * 4)).padStart(2, "0")}`;
}

async function seed() {
  console.log("Seeding database...");

  await db.delete(reviewIssues);
  await db.delete(performanceReviews);
  await db.delete(issueComments);
  await db.delete(metricReadings);
  await db.delete(actions);
  await db.delete(issues);
  await db.delete(metrics);
  await db.delete(departments);

  await db.insert(departments).values([
    { id: "public-works", name: "Public Works", slug: "public-works" },
    { id: "resident-response", name: "Resident Response Center", slug: "resident-response" },
    { id: "engineering-permitting", name: "Engineering & Permitting", slug: "engineering-permitting" },
  ]);

  await db.insert(metrics).values([
    { id: "m1", name: "Pothole Response Time", departmentId: "public-works", value: "4.2", target: "3.0", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m2", name: "Illegal Dumping Cleanup", departmentId: "public-works", value: "2.4", target: "2.0", unit: "days", status: "at-risk", period: "2026-06" },
    { id: "m3", direction: "higher-better" as const, name: "Street Cleaning Completion", departmentId: "public-works", value: "81", target: "95", unit: "%", status: "off-target", period: "2026-06" },
    { id: "m4", name: "Work Order Backlog", departmentId: "public-works", value: "312", target: "150", unit: "orders", status: "off-target", period: "2026-06" },
    { id: "m5", name: "Avg. Response Time", departmentId: "resident-response", value: "2.8", target: "1.0", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m6", direction: "higher-better" as const, name: "Resolution Rate", departmentId: "resident-response", value: "74", target: "90", unit: "%", status: "off-target", period: "2026-06" },
    { id: "m7", name: "Open Requests", departmentId: "resident-response", value: "537", target: "200", unit: "requests", status: "off-target", period: "2026-06" },
    { id: "m8", direction: "higher-better" as const, name: "SLA Compliance", departmentId: "resident-response", value: "68", target: "85", unit: "%", status: "off-target", period: "2026-06" },
    { id: "m9", name: "Permit Review Time", departmentId: "engineering-permitting", value: "21", target: "10", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m10", direction: "higher-better" as const, name: "Inspection Completion", departmentId: "engineering-permitting", value: "88", target: "95", unit: "%", status: "at-risk", period: "2026-06" },
    { id: "m11", name: "Permit Backlog", departmentId: "engineering-permitting", value: "94", target: "50", unit: "permits", status: "off-target", period: "2026-06" },
    { id: "m12", name: "Approval Cycle Time", departmentId: "engineering-permitting", value: "34", target: "21", unit: "days", status: "off-target", period: "2026-06" },
  ]);

  // 8 weeks of historical readings per metric (trending worse over time)
  const trends: Record<string, number[]> = {
    m1:  [2.8, 2.9, 3.1, 3.0, 3.4, 3.7, 4.0, 4.2],
    m2:  [1.7, 1.8, 1.9, 1.8, 2.0, 2.1, 2.3, 2.4],
    m3:  [93,  92,  91,  90,  88,  86,  83,  81],
    m4:  [180, 195, 210, 225, 248, 272, 295, 312],
    m5:  [1.2, 1.3, 1.5, 1.7, 1.9, 2.2, 2.5, 2.8],
    m6:  [88,  87,  85,  83,  81,  79,  76,  74],
    m7:  [210, 245, 278, 305, 370, 420, 480, 537],
    m8:  [83,  82,  81,  79,  77,  74,  71,  68],
    m9:  [11,  12,  13,  14,  15,  17,  19,  21],
    m10: [94,  94,  93,  92,  91,  90,  89,  88],
    m11: [52,  57,  62,  67,  73,  80,  87,  94],
    m12: [22,  23,  24,  26,  28,  30,  32,  34],
  };

  const readingRows = [];
  for (const [metricId, values] of Object.entries(trends)) {
    for (let i = 0; i < values.length; i++) {
      readingRows.push({
        id: `r-${metricId}-${i}`,
        metricId,
        value: String(values[i]),
        period: weekLabel(7 - i),
        recordedAt: weeksAgo(7 - i),
      });
    }
  }
  await db.insert(metricReadings).values(readingRows);

  await db.insert(issues).values([
    { id: "i1", title: "Permit review delays causing construction slowdowns citywide", description: "Review times have increased from 10 to 21 days over the past 60 days. At least 12 developers have filed formal complaints. Construction starts are being deferred.", departmentId: "engineering-permitting", status: "escalated", priority: "critical", createdAt: new Date("2026-05-14"), updatedAt: new Date("2026-06-01") },
    { id: "i2", title: "Ward F pothole backlog — 90+ unaddressed complaints", description: "Ward F has the highest density of unresolved pothole complaints in the city. Response time in this ward is averaging 6.1 days vs. the 3-day target.", departmentId: "public-works", status: "in-progress", priority: "high", createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-28") },
    { id: "i3", title: "Illegal dumping hotspot — MLK Drive between 3rd and 7th", description: "Six separate dumping incidents reported in a two-block stretch over the past 30 days. Area is not covered by current camera infrastructure.", departmentId: "public-works", status: "open", priority: "high", createdAt: new Date("2026-06-01"), updatedAt: new Date("2026-06-01") },
    { id: "i4", title: "RRC call volume exceeding daily capacity by 40%", description: "The Resident Response Center is receiving ~850 contacts per day against a staff capacity of ~600. Average hold times have reached 18 minutes.", departmentId: "resident-response", status: "in-progress", priority: "critical", createdAt: new Date("2026-05-10"), updatedAt: new Date("2026-06-03") },
    { id: "i5", title: "Street sweeper fleet — 3 of 8 vehicles out of service", description: "Deferred maintenance has left 3 sweepers offline. June completion rate is projected at 76% without intervention.", departmentId: "public-works", status: "open", priority: "medium", createdAt: new Date("2026-06-04"), updatedAt: new Date("2026-06-04") },
    { id: "i6", title: "311 repeat complaints trending up — same addresses filing 3+ requests", description: "214 addresses have filed 3 or more 311 requests in the past 90 days for the same issue type, indicating issues are not being resolved on first contact.", departmentId: "resident-response", status: "open", priority: "medium", createdAt: new Date("2026-06-05"), updatedAt: new Date("2026-06-05") },
  ]);

  await db.insert(actions).values([
    { id: "a1", issueId: "i1", description: "Post two temporary plan reviewer positions and begin recruitment immediately", ownerId: "director-ep", status: "in-progress", dueDate: new Date("2026-06-20"), createdAt: new Date("2026-06-02"), updatedAt: new Date("2026-06-02") },
    { id: "a2", issueId: "i1", description: "Implement triage queue: separate commercial from residential to reduce backlog for simpler applications", ownerId: "director-ep", status: "not-started", dueDate: new Date("2026-06-15"), createdAt: new Date("2026-06-02"), updatedAt: new Date("2026-06-02") },
    { id: "a3", issueId: "i2", description: "Assign dedicated crew to Ward F for two-week blitz — target closure of all complaints older than 5 days", ownerId: "director-pw", status: "in-progress", dueDate: new Date("2026-06-18"), createdAt: new Date("2026-05-28"), updatedAt: new Date("2026-06-01") },
    { id: "a4", issueId: "i4", description: "Activate overflow call routing to supplemental vendor contract", ownerId: "director-rrc", status: "complete", dueDate: new Date("2026-06-10"), completedAt: new Date("2026-06-08"), createdAt: new Date("2026-06-03"), updatedAt: new Date("2026-06-08") },
    { id: "a5", issueId: "i4", description: "Conduct staffing analysis and submit budget amendment request for 4 additional FTEs", ownerId: "director-rrc", status: "in-progress", dueDate: new Date("2026-06-30"), createdAt: new Date("2026-06-03"), updatedAt: new Date("2026-06-03") },
    { id: "a6", issueId: "i5", description: "Emergency procurement for two sweeper service contracts — get Fleet Management authorization", ownerId: "director-pw", status: "not-started", dueDate: new Date("2026-06-12"), createdAt: new Date("2026-06-04"), updatedAt: new Date("2026-06-04") },
  ]);

  await db.insert(issueComments).values([
    { id: "c1", issueId: "i1", authorName: "Director Matos", body: "Escalating to BA. This is blocking two major development projects on Hudson Street and has been flagged by the Mayor's office.", createdAt: new Date("2026-06-01T09:15:00") },
    { id: "c2", issueId: "i1", authorName: "BA Office", body: "Confirmed — this needs to be resolved before the June 15 developer roundtable. Director Matos, please provide a remediation plan by EOD Friday.", createdAt: new Date("2026-06-01T14:30:00") },
    { id: "c3", issueId: "i1", authorName: "Director Matos", body: "Remediation plan submitted. Two actions created: (1) open recruiter posting for temp reviewers today, (2) stand up triage queue by June 15.", createdAt: new Date("2026-06-02T10:00:00") },
    { id: "c4", issueId: "i2", authorName: "Supervisor Chen", body: "Ward F crew deployed Monday. Targeting 30 closures by end of week. Will update Friday.", createdAt: new Date("2026-05-28T08:00:00") },
    { id: "c5", issueId: "i2", authorName: "Supervisor Chen", body: "Week 1 complete — 28 potholes closed in Ward F. 62 remaining. Pace is good, on track for target.", createdAt: new Date("2026-06-04T16:45:00") },
    { id: "c6", issueId: "i4", authorName: "Director Williams", body: "Overflow routing is live as of this morning. Hold times dropped from 18 min to 9 min. Monitoring through end of week.", createdAt: new Date("2026-06-08T11:20:00") },
  ]);

  await db.insert(performanceReviews).values([
    { id: "pr1", type: "weekly", departmentId: "public-works", reviewDate: new Date("2026-06-02"), attendees: "Director Johnson, Supervisor Chen, Supervisor Rodriguez, Analyst Park", summary: "Ward F pothole blitz approved and crew deployed. Street sweeper procurement request flagged — Fleet Management to respond by June 10. Work order backlog trending up; root cause identified as two crew members on medical leave.", status: "completed", createdAt: new Date("2026-06-02") },
    { id: "pr2", type: "weekly", departmentId: "resident-response", reviewDate: new Date("2026-06-03"), attendees: "Director Williams, Supervisor Torres, QA Lead Kim", summary: "Overflow routing approved and being stood up. Staffing analysis due June 30. Repeat complaint pattern flagged as new issue for investigation.", status: "completed", createdAt: new Date("2026-06-03") },
    { id: "pr3", type: "monthly", departmentId: null, reviewDate: new Date("2026-06-05"), attendees: "Mayor Fulop, BA Lenz, Director Johnson, Director Williams, Director Matos", summary: "Permit delays escalated to executive level. Mayor directed BA to monitor weekly until resolved. RRC staffing amendment to go to council in July budget amendment. Infrastructure metrics trending wrong direction — executive intervention requested.", status: "completed", createdAt: new Date("2026-06-05") },
    { id: "pr4", type: "weekly", departmentId: "engineering-permitting", reviewDate: new Date("2026-06-09"), attendees: "Director Matos, Deputy Director Shah, Analyst Rivera", summary: null, status: "scheduled", createdAt: new Date("2026-06-07") },
  ]);

  await db.insert(reviewIssues).values([
    { id: "ri1", reviewId: "pr1", issueId: "i2", notes: "Crew deployed Monday. 30-closure target by end of week." },
    { id: "ri2", reviewId: "pr1", issueId: "i5", notes: "Procurement authorization requested from Fleet Management." },
    { id: "ri3", reviewId: "pr2", issueId: "i4", notes: "Overflow vendor contract being activated." },
    { id: "ri4", reviewId: "pr2", issueId: "i6", notes: "New issue logged. Data pull requested from 311 system." },
    { id: "ri5", reviewId: "pr3", issueId: "i1", notes: "Escalated by BA. Mayor directed weekly check-ins." },
    { id: "ri6", reviewId: "pr3", issueId: "i4", notes: "Budget amendment for 4 FTEs to go to council in July." },
  ]);

  console.log("Done.");
  await client.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
