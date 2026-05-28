import { getMyLessonPlans } from "../_actions/lesson-plans";
import { LessonPlansClient } from "./lesson-plans-client";

export default async function StudentLessonPlansPage() {
  const plans = await getMyLessonPlans();
  
  const serialized = plans.map(p => ({
    id: p.id,
    topic: p.topic,
    subject: p.subject,
    classForm: p.classForm,
    status: p.status,
    date: p.date.toISOString().split("T")[0],
    createdAt: p.createdAt.toISOString()
  }));

  return <LessonPlansClient plans={serialized} />;
}
