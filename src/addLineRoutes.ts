import { sleep } from "bun";
import { sql } from "./db";
import { getRoutes } from "./requests/getRoutes";
import { Line } from "./types/line";

export const addLineRoutes = async () => {
  const lines =
    await sql`SELECT * FROM lines WHERE code NOT IN (SELECT route_short_name FROM routes)`;
  console.log("found", lines.count, "lines without routes");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] as Line;

    console.log("getting routes for", line);
    const allRoutes = await getRoutes(line.code);

    const routes = allRoutes?.map((route) => ({
      id: route.GUZERGAH_ID,
      agency_id: 1,
      route_short_name: line.code,
      route_long_name: route.GUZERGAH_GUZERGAH_ADI,
      route_type: 3,
      // route_desc: undefined,
      route_code: route.GUZERGAH_GUZERGAH_KODU,
    }));

    if (routes.length < 1) {
      console.log("no routes found for", line.code);
      continue;
    }

    try {
      console.log('inserting routes', line.code)
      await sql`INSERT INTO routes ${sql(routes)}`;
    } catch (error) {
      console.error(error)
    }

    console.log('sleeping for 2 seconds')
    await sleep(2_000)
  }
};

if (import.meta.main) {
  addLineRoutes();
}
