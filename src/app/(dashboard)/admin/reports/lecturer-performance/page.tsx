import { getLecturerPerformanceData } from "../../_actions/reports";
import { LecturerPerformanceClient } from "./lecturer-performance-client";

export default async function LecturerPerformancePage() {
  const data = await getLecturerPerformanceData();
  return <LecturerPerformanceClient data={JSON.parse(JSON.stringify(data))} />;
}
