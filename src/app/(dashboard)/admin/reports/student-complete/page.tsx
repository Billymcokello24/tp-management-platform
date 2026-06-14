import { getStudentCompleteTPData } from "../../_actions/reports";
import { StudentCompleteTPClient } from "./student-complete-tp-client";

export default async function StudentCompleteTPPage() {
  const data = await getStudentCompleteTPData();
  return <StudentCompleteTPClient data={JSON.parse(JSON.stringify(data))} />;
}
