import { Metadata } from "next";
import { getZones } from "../_actions/crud";
import { ZonesClient } from "./zones-client";

export const metadata: Metadata = {
  title: "Supervision Zones | TMU Admin",
  description: "Manage teaching practice supervision zones",
};

export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto">
      <ZonesClient zones={zones} />
    </div>
  );
}
