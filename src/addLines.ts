import { createReadStream } from "fs";
import { sql, logger } from "./db";
import CsvReader from "csv-reader";
import { RawLine } from "./types/izmir/line";
import { DatabaseLine } from "./types/line";
import { DATA_FOLDER, LINES_FILE, ROUTES_FILE } from "./constants";

export const addLinesIstanbul = async () => {
  const linesInDb = await sql`Select code FROM lines`;
  logger.info(`Got ${linesInDb.count} lines from database.`);
};

export const addLinesIzmir = async () => {
  const linesInDb = await sql`Select code FROM lines`;
  logger.info(`Got ${linesInDb.count} lines from database.`);

  const lineCodesInDbSet = new Set(linesInDb.map(x => x.code))

  const csvReaderOptions = {
    asObject: true,
    trim: true,
    parseBooleans: true,
    parseNumbers: true,
    delimiter: ";",
  }

  const readableStream = createReadStream(`./data/izmir/${LINES_FILE}`, "utf-8");
  const csvReader = new CsvReader(csvReaderOptions);

  const lines: DatabaseLine[] = [];

  readableStream.pipe(csvReader).on("data", (row: RawLine) => {
    if (lineCodesInDbSet.has(row.HAT_NO)) return
    
    lines.push({
      code: row.HAT_NO.toString(),
      title: row.HAT_ADI,
    });
  });

  logger.info(`Adding ${lines.length} lines to database.`);
  // await sql`INSERT INTO lines ${sql(lines)}`

  // Line Routes
  const routesReadableStream = createReadStream(`${DATA_FOLDER}/izmir/${ROUTES_FILE}`, "utf-8")
  const routesReader = new CsvReader(csvReaderOptions)

  routesReadableStream.pipe(routesReader).on("data", (row: RawLine) => {
    
  })
};

// export const addLines = async () => {
//   // const routeLine = routesText.split('\n')
//   const linesInDb = await sql`SELECT code FROM lines`;
//   console.log('got', linesInDb.count, 'lines from db')

//   const routeLines: Line[] = []
//   const addedLines = new Set(linesInDb.map(x => x.code))

//   // for (let index = 1; index < routeLine.length; index++) {
//   //   const element = routeLine[index];
//   //   if (element.startsWith(`"`)) {
//   //     console.log('skipping index', index)
//   //     continue
//   //   }

//   //   const [
//   //     route_id,
//   //     agency_id,
//   //     route_short_name,
//   //     route_long_name,
//   //     route_type,
//   //     route_desc,
//   //     route_code
//   //   ] = element.split(',')

//   //   if (!route_short_name || !route_long_name) {
//   //     console.log('skipping index', index)
//   //     continue
//   //   }

//   //   if (addedLines.has(route_short_name)) {
//   //     console.log(route_short_name, 'already added. Skipping')
//   //     continue
//   //   }

//   //   routeLines.push({
//   //     code: route_short_name,
//   //     title: route_long_name
//   //   })

//   //   addedLines.add(route_short_name)
//   // }

//   // console.log('found', routeLine.length, 'lines inside routes.csv. Checking osm now.')

//   const refs: Line[] = busLineFeatures.map(feature => ({
//     code: feature.properties.ref,
//     title: feature.properties.name
//   }))

//   const refsFiltered = refs.filter(ref => !addedLines.has(ref.code))
//   console.log('found', refsFiltered.length, 'lines in osm file that are not in db')

//   routeLines.push(...refsFiltered)
//   console.log('adding', routeLines.length, 'lines to the db..')

//   if (routeLines.length < 1) return

//   const results = await sql`INSERT INTO lines ${sql(routeLines)}`
//   console.log('added record count', results.count)
// }

if (import.meta.main) {
  // addLines()
}
