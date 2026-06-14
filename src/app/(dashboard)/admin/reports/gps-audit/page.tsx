import { getGPSAuditData } from "../../_actions/reports";
import { GPSAuditClient } from "./gps-audit-client";

export default async function GPSAuditPage() {
  const data = await getGPSAuditData();
  return <GPSAuditClient data={JSON.parse(JSON.stringify(data))} />;
}
