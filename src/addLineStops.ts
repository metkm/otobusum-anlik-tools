import { sleep } from "bun";
import { sql } from "./db";
import { getStops } from "./requests/getStops";
import { Line } from "./types/line";

export const addLineStops = async () => {
  const results: Line[] =
    await sql`SELECT * FROM lines WHERE code NOT IN (SELECT line_code FROM line_stops)`;

  for (let index = 0; index < results.length; index++) {
    const line = results[index];
    console.log("line", line, `${index}/${results.length}`);

    console.log("getting all stops", line.code);
    const stops = await getStops(line.code);
    
    if (stops.length < 1) {
      console.log('no stops found for', line.code, 'skipping and deleting')
      
      await sql`DELETE FROM lines WHERE code = ${line.code}`

      await sleep(3000)
      continue
    }

    console.log("parsing all stops");
    const stopsParsed = stops?.map((stop) => ({
      stop_code: stop.DURAK_DURAK_KODU,
      stop_name: stop.DURAK_ADI,
      x_coord: stop.DURAK_GEOLOC.x,
      y_coord: stop.DURAK_GEOLOC.y,
      province: stop.ILCELER_ILCEADI,
      direction: stop.DURAK_YON_BILGISI,
      smart: false,
      // physical: 'AÇIK',
      stop_type: "İETTBAYRAK",
      disabled_can_use: "Uygun Değil",
    }));

    try {
      console.log("inserting stops");
      await sql`INSERT INTO stops ${sql(stopsParsed)}`;
    } catch (error) {
      console.error(error);
    }

    const lineStops = stopsParsed.map((sp) => ({
      line_code: line.code,
      stop_code: sp.stop_code,
    }));

    try {
      console.log('inserting line stops')
      await sql`INSERT INTO line_stops ${sql(lineStops)}`;
    } catch (error) {
      console.error(error);
    }

    console.log('sleeping for 3 seconds')
    await sleep(3_000)
  }
};

if (import.meta.main) {
  addLineStops();
}
