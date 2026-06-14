import { getSchoolPerformanceData } from "../../_actions/reports";
import { SchoolPerformanceClient } from "./school-performance-client";

export default async function SchoolPerformancePage() {
  const data = await getSchoolPerformanceData();
  return <SchoolPerformanceClient data={JSON.parse(JSON.stringify(data))} />;
}
