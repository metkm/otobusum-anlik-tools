import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";

import { RawStop } from "./types/izmir/stop";
import { DATA_FOLDER, STOPS_FILE } from "./constants";
import { csvOptions } from "./cityOptions";
import { logger, sql } from "./db";
import { DatabaseStop } from "./types/database";

export const addStopsIstanbul = () => {};

export const addStopsIzmir = async () => {
  const content = await readFile(`${DATA_FOLDER}/izmir/${STOPS_FILE}`, {
    encoding: "utf-8",
  });

  const parsed: RawStop[] = parse(content, csvOptions);
  logger.info(`Found ${parsed.length} stops. Adding to the database`);

  const stopsTransformed: DatabaseStop[] = parsed.map(stop => ({
    stop_code: stop.DURAK_ID,
    stop_name: stop.DURAK_ADI,
    x_coord: stop.BOYLAM,
    y_coord: stop.ENLEM,
    city: 'izmir',
  }))

  await sql`INSERT INTO stops ${sql(stopsTransformed)}`;
};
