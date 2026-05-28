import { getReportsData } from "../_actions/reports";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const data = await getReportsData();
  return <ReportsClient data={data} />;
}
