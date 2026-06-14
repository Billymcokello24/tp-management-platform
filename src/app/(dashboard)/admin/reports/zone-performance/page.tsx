import { getZonePerformanceData } from "../../_actions/reports";
import { ZonePerformanceClient } from "./zone-performance-client";

export default async function ZonePerformancePage() {
  const data = await getZonePerformanceData();
  return <ZonePerformanceClient data={JSON.parse(JSON.stringify(data))} />;
}
