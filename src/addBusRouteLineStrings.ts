import { sleep } from "bun";
import { sql } from "./db";
import { getRouteString } from "./requests/getRouteString";

// check for line swith one way only. eg
// KM41
export const addBusRouteLineStrings = async () => {
  const linesRoutes =
    await sql`SELECT * FROM routes WHERE route_code LIKE '%_D0' AND route_code NOT IN (SELECT route_code FROM route_paths)`;
  const routeCodes = linesRoutes.map((x) => x.route_code);

  console.log("starting got", routeCodes.length, "routeCodes");
  for (let index = 0; index < routeCodes.length; index++) {
    const routeCode = routeCodes[index];

    console.log("getting route line for", routeCode);
    try {
      const routeLine = await getRouteString(routeCode);
      const firstRoute = routeLine.at(0)

      if (!firstRoute?.line) {
        console.log('no line found for', routeCode)
        continue
      }

      const parts = firstRoute?.line.split("|");
      if (!parts || parts.length < 1) {
        console.log("no parts, sleeping for 2 seconds");
        await sleep(4000);
        continue;
      }

      console.log("parsing route lines", routeCode);
      const parsed = parts
        .map((part) => {
          const inner = part.split("(")[1].split(")")[0].trim();
          const numbers = inner.split(",");

          return numbers.map((nums) => {
            const [left, right] = nums.trim().split(" ");
            return {
              lng: parseFloat(left), // x
              lat: parseFloat(right), // y
            };
          });
        })
        .flat();

      const toInsert = {
        route_code: routeCode,
        route_path: parsed,
      };

      // const toInsert  = `[${parsed.map(loc => `(${loc.lng},${loc.lat})`)}]`
      console.log("inserting", parsed.length, "line points");
      await sql`INSERT INTO route_paths ${sql(
        toInsert
      )} ON CONFLICT (route_code) DO UPDATE SET ${sql(toInsert)}`;

      console.log("sleeping for 4 seconds");
      await sleep(4000);
    } catch (error) {
      console.error('skipping because of error', error, routeCode);
      
      if ((error.message as string).includes('parse JSON')) {
        console.log('deleting', routeCode)
        await sql`DELETE FROM routes WHERE route_code = ${routeCode}`
      }

      await sleep(4000);
    }
  }
};

if (import.meta.main) {
  addBusRouteLineStrings();
}
