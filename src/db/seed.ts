import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { departments, metrics, issues, actions } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  console.log("Seeding database...");

  await db.delete(actions);
  await db.delete(issues);
  await db.delete(metrics);
  await db.delete(departments);

  await db.insert(departments).values([
    { id: "public-works", name: "Public Works", slug: "public-works", directorId: null },
    { id: "resident-response", name: "Resident Response Center", slug: "resident-response", directorId: null },
    { id: "engineering-permitting", name: "Engineering & Permitting", slug: "engineering-permitting", directorId: null },
  ]);

  await db.insert(metrics).values([
    // Public Works
    { id: "m1", name: "Pothole Response Time", departmentId: "public-works", value: "4.2", target: "3.0", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m2", name: "Illegal Dumping Cleanup", departmentId: "public-works", value: "2.4", target: "2.0", unit: "days", status: "at-risk", period: "2026-06" },
    { id: "m3", name: "Street Cleaning Completion", departmentId: "public-works", value: "81", target: "95", unit: "%", status: "off-target", period: "2026-06" },
    { id: "m4", name: "Work Order Backlog", departmentId: "public-works", value: "312", target: "150", unit: "orders", status: "off-target", period: "2026-06" },
    // Resident Response
    { id: "m5", name: "Avg. Response Time", departmentId: "resident-response", value: "2.8", target: "1.0", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m6", name: "Resolution Rate", departmentId: "resident-response", value: "74", target: "90", unit: "%", status: "off-target", period: "2026-06" },
    { id: "m7", name: "Open Requests", departmentId: "resident-response", value: "537", target: "200", unit: "requests", status: "off-target", period: "2026-06" },
    { id: "m8", name: "SLA Compliance", departmentId: "resident-response", value: "68", target: "85", unit: "%", status: "off-target", period: "2026-06" },
    // Engineering & Permitting
    { id: "m9", name: "Permit Review Time", departmentId: "engineering-permitting", value: "21", target: "10", unit: "days", status: "off-target", period: "2026-06" },
    { id: "m10", name: "Inspection Completion", departmentId: "engineering-permitting", value: "88", target: "95", unit: "%", status: "at-risk", period: "2026-06" },
    { id: "m11", name: "Permit Backlog", departmentId: "engineering-permitting", value: "94", target: "50", unit: "permits", status: "off-target", period: "2026-06" },
    { id: "m12", name: "Approval Cycle Time", departmentId: "engineering-permitting", value: "34", target: "21", unit: "days", status: "off-target", period: "2026-06" },
  ]);

  await db.insert(issues).values([
    {
      id: "i1", title: "Permit review delays causing construction slowdowns citywide",
      description: "Review times have increased from 10 to 21 days over the past 60 days. At least 12 developers have filed formal complaints. Construction starts are being deferred.",
      departmentId: "engineering-permitting", status: "escalated", priority: "critical",
      createdAt: new Date("2026-05-14"), updatedAt: new Date("2026-06-01"),
    },
    {
      id: "i2", title: "Ward F pothole backlog — 90+ unaddressed complaints",
      description: "Ward F has the highest density of unresolved pothole complaints in the city. Response time in this ward is averaging 6.1 days vs. the 3-day target.",
      departmentId: "public-works", status: "in-progress", priority: "high",
      createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-28"),
    },
    {
      id: "i3", title: "Illegal dumping hotspot — MLK Drive between 3rd and 7th",
      description: "Six separate dumping incidents reported in a two-block stretch over the past 30 days. Area is not covered by current camera infrastructure.",
      departmentId: "public-works", status: "open", priority: "high",
      createdAt: new Date("2026-06-01"), updatedAt: new Date("2026-06-01"),
    },
    {
      id: "i4", title: "RRC call volume exceeding daily capacity by 40%",
      description: "The Resident Response Center is receiving ~850 contacts per day against a staff capacity of ~600. Average hold times have reached 18 minutes. Complaints about unresponsiveness are increasing.",
      departmentId: "resident-response", status: "in-progress", priority: "critical",
      createdAt: new Date("2026-05-10"), updatedAt: new Date("2026-06-03"),
    },
    {
      id: "i5", title: "Street sweeper fleet — 3 of 8 vehicles out of service",
      description: "Deferred maintenance has left 3 sweepers offline. June completion rate is projected at 76% without intervention, well below the 95% target.",
      departmentId: "public-works", status: "open", priority: "medium",
      createdAt: new Date("2026-06-04"), updatedAt: new Date("2026-06-04"),
    },
    {
      id: "i6", title: "311 repeat complaints trending up — same addresses filing 3+ requests",
      description: "Data shows 214 addresses have filed 3 or more 311 requests in the past 90 days for the same issue type, indicating issues are not being resolved on first contact.",
      departmentId: "resident-response", status: "open", priority: "medium",
      createdAt: new Date("2026-06-05"), updatedAt: new Date("2026-06-05"),
    },
  ]);

  await db.insert(actions).values([
    {
      id: "a1", issueId: "i1", description: "Post two temporary plan reviewer positions and begin recruitment immediately",
      ownerId: "director-ep", status: "in-progress", dueDate: new Date("2026-06-20"),
      createdAt: new Date("2026-06-02"), updatedAt: new Date("2026-06-02"),
    },
    {
      id: "a2", issueId: "i1", description: "Implement triage queue: separate commercial permits from residential to reduce backlog for simpler applications",
      ownerId: "director-ep", status: "not-started", dueDate: new Date("2026-06-15"),
      createdAt: new Date("2026-06-02"), updatedAt: new Date("2026-06-02"),
    },
    {
      id: "a3", issueId: "i2", description: "Assign dedicated crew to Ward F for two-week blitz — target closure of all complaints older than 5 days",
      ownerId: "director-pw", status: "in-progress", dueDate: new Date("2026-06-18"),
      createdAt: new Date("2026-05-28"), updatedAt: new Date("2026-06-01"),
    },
    {
      id: "a4", issueId: "i4", description: "Activate overflow call routing to supplemental vendor contract",
      ownerId: "director-rrc", status: "complete", dueDate: new Date("2026-06-10"),
      completedAt: new Date("2026-06-08"),
      createdAt: new Date("2026-06-03"), updatedAt: new Date("2026-06-08"),
    },
    {
      id: "a5", issueId: "i4", description: "Conduct staffing analysis and submit budget amendment request for 4 additional FTEs",
      ownerId: "director-rrc", status: "in-progress", dueDate: new Date("2026-06-30"),
      createdAt: new Date("2026-06-03"), updatedAt: new Date("2026-06-03"),
    },
    {
      id: "a6", issueId: "i5", description: "Emergency procurement for two sweeper service contracts — get Fleet Management authorization",
      ownerId: "director-pw", status: "not-started", dueDate: new Date("2026-06-12"),
      createdAt: new Date("2026-06-04"), updatedAt: new Date("2026-06-04"),
    },
  ]);

  console.log("Done.");
  await client.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
