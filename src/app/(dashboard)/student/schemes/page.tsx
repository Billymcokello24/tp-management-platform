import { getSchemesOfWork } from "../_actions/schemes";
import { SchemesClient } from "./schemes-client";

export default async function StudentSchemesPage() {
  const schemes = await getSchemesOfWork();
  return <SchemesClient initialSchemes={schemes} />;
}
