import { getReportsData, getLecturerAssessmentReports, getLecturerLocationReports } from "../_actions/reports";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const [data, lecturerReports, locationReports] = await Promise.all([
    getReportsData(),
    getLecturerAssessmentReports(),
    getLecturerLocationReports(),
  ]);
  return (
    <ReportsClient
      data={data}
      lecturerReports={JSON.parse(JSON.stringify(lecturerReports))}
      locationReports={JSON.parse(JSON.stringify(locationReports))}
    />
  );
}
