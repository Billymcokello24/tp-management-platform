import { getMyStudentsWithLessonPlans } from "../_actions/lecturer";
import { LecturerLessonPlansClient } from "./lesson-plans-client";

export default async function LecturerLessonPlansPage() {
  const students = await getMyStudentsWithLessonPlans();

  const serialized = students.map((s: any) => ({
    id: s.id,
    name: s.user.name,
    email: s.user.email,
    schoolName: s.school?.name || "Pending Placement",
    schoolCounty: s.school?.county || "N/A",
    lessonPlans: s.lessonPlans.map((lp: any) => ({
      id: lp.id,
      subject: lp.subject,
      topic: lp.topic,
      classForm: lp.classForm,
      date: lp.date.toISOString(),
      status: lp.status,
      createdAt: lp.createdAt.toISOString(),
    })),
  }));

  return <LecturerLessonPlansClient students={serialized} />;
}
