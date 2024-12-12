import "dotenv/config";
import { LineFeature } from "./types/features";
import { sleep } from "bun";
import { getRoutes } from "./requests/getRoutes";
import { sql } from './db'
import { busLineFeatures } from "./osm/getAllOsmLines";
import { addLineStops } from "./addLineStops";

const allLines = await sql`SELECT * FROM lines`;
const lineCodesInDb = allLines.map((x) => x.code);

const codesNotInDb = busLineFeatures.filter(
  (feature) => !lineCodesInDb.includes(feature.properties.ref)
);

console.log("Total of codes that not in database but in OSM", codesNotInDb.length);
for (let index = 0; index < codesNotInDb.length; index++) {
  const element = codesNotInDb[index] as LineFeature;
  const properties = element.properties;
  const cleanName = `${properties.from} - ${properties.to}`.toUpperCase();

  console.log("inserting line", [properties.ref, cleanName]);
  await sql`INSERT INTO lines (code, title) VALUES ${sql([properties.ref, cleanName])}`;

  try {
    console.log("getting routes for", properties.ref);
    const allRoutes = await getRoutes(properties.ref);

    const routes = allRoutes?.map((route) => ({
      agency_id: 1,
      route_short_name: properties.ref,
      route_long_name: route.GUZERGAH_GUZERGAH_ADI,
      route_type: 3,
      // route_desc: undefined,
      route_code: route.GUZERGAH_GUZERGAH_KODU,
    }));

    if (routes.length < 1) {
      console.log("no routes found for", properties.ref);
      continue;
    }

    console.log('inserting routes')
    await sql`INSERT INTO routes ${sql(routes)}`;

    // const allStops = await getStops(properties.ref)
    // console.log('getting stops')
    
    // const stops = allStops?.map(stop => ({
    //   stop_code: stop.DURAK_DURAK_KODU,
    //   stop_name: stop.DURAK_ADI,
    //   x_coord: stop.DURAK_GEOLOC.x,
    //   y_coord: stop.DURAK_GEOLOC.y,
    //   province: stop.ILCELER_ILCEADI,
    //   direcion: stop.DURAK_YON_BILGISI,
    //   smart: false,
    //   // physical: 'AÇIK',
    //   stop_type: 'İETTBAYRAK',
    //   disabled_can_use: 'Uygun Değil'
    // }))

    // await sql`INSERT INTO stops ${sql(stops)}`

    // console.log("sleeping for 1 seconds");
    await sleep(1000);
  } catch (error) {
    console.error(error);
  }

  console.log('adding line stops')
  await addLineStops()
}
