import cron from "node-cron";
import { setup } from "./discord.ts";

if (import.meta.main) {
  console.log("Scheduling cron job for every hour");
  cron.schedule(
    "0 * * * *",
    async () => {
      const client = await setup();
      console.log("Done with big ben for now");
    },
    {
      timezone: "Europe/Brussels",
    },
  );
}
