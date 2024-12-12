import { sleep } from "bun";
import { sql } from "./db";
import { getRouteString } from "./requests/getRouteString";

export const addBusLineString = async () => {
  const linesRoutes = await sql`SELECT * FROM routes WHERE route_code LIKE '%_D0'`;
  const routeCodes = linesRoutes.map((x) => x.route_code);

  console.log('starting got', routeCodes.length, 'routeCodes')
  for (let index = 0; index < routeCodes.length; index++) {
    const routeCode = routeCodes[index];

    console.log('getting route line for', routeCode)
    const routeLine = await getRouteString(routeCode);

    const parts = routeLine.at(0)?.line.split('|')
    if (!parts) {
      console.log('no parts, sleeping for 2 seconds')
      await sleep(4000)
      continue
    }

    console.log('parsing route lines', routeCode)
    const parsed = parts.map(
      part => {
        const inner = part.split('(')[1].split(')')[0].trim()
        const numbers = inner.split(',')
        
        return numbers.map(
          nums => {
            const [left, right] = nums.trim().split(' ')
            return {
              lng: parseFloat(left), // x
              lat: parseFloat(right) // y
            }
          }
        )
      }
    )
      .flat()

    const toInsert  = `[${parsed.map(loc => `(${loc.lng},${loc.lat})`)}]`
    console.log('inserting', parsed.length, 'line points')
    await sql`INSERT INTO route_lines VALUES (${routeCode}, ${toInsert})`

    console.log('sleeping for 2 seconds')
    await sleep(4000)
  }
};

export const getBusLineString = async (routeCode: string) => {
  const results = await sql`  SELECT json_agg(json_build_object('lat', point[1], 'lng', point[0])) AS points
  FROM (
    SELECT 
      (ST_DumpPoints(linestring)).geom AS geom
    FROM route_lines
    WHERE route_code = ${routeCode}
  ) AS dumped_points,
  LATERAL (ARRAY[ST_Y(geom), ST_X(geom)]) AS point`
  const firstResult = results.at(0)

  console.log(firstResult?.linestring)
}

if (import.meta.main) {
  addBusLineString();
  // getBusLineString('133P')
}
