import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import osmtogeojson from "osmtogeojson";

import { IstanbulRawLineRoute } from "./types/istanbul/routes";
import { RawLine, RawLineRoute } from "./types/izmir/line";
import { PathCoordinate } from "./types/database";

import { csvOptions } from "./options";
import { sql, logger } from "./db";
import {
  DATA_FOLDER,
  LINE_ROUTE_PATHS_FILE,
  LINE_ROUTES_FILE,
  LINES_FILE,
  LINES_GEOJSON_FILE,
} from "./constants";
import { DatabaseLine } from "./types/line";
import { groupedByKey } from "./utils";
import { Element, GeoJson } from "./types/geojson";

export const addLinesIstanbul = async () => {
  // const linesInDb = await sql`Select code FROM lines`;
  // logger.info(`got ${linesInDb.count} lines from database`);

  logger.info("reading & parsing routes file");
  const routesContent = await readFile(`${DATA_FOLDER}/istanbul/${LINE_ROUTES_FILE}`, {
    encoding: "utf-8",
  });

  const clearedLines = routesContent
    .split("\r\n")
    .map((line) => {
      if (line.startsWith(`"`)) {
        let cleanLine = line.slice(1, -2);
        cleanLine = cleanLine.replaceAll(`""`, `"`);

        return cleanLine;
      }

      return line;
    })
    .join("\r\n");

  const routes: IstanbulRawLineRoute[] = parse(clearedLines, {
    ...csvOptions,
    delimiter: ",",
  });
  logger.info(`found ${routes.length} routes from ${LINE_ROUTES_FILE}`);

  const linesToInsert: DatabaseLine[] = [];
  const linesCodesAdded = new Set();

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    if (linesCodesAdded.has(route.route_short_name.toString())) continue

    linesToInsert.push({
      city: "istanbul",
      code: route.route_short_name,
      title: route.route_long_name
    })

    linesCodesAdded.add(route.route_short_name.toString());
  }
  logger.info(`found ${linesCodesAdded.size} lines to insert`);


  const osmContent = await readFile(`${DATA_FOLDER}/istanbul/${LINES_GEOJSON_FILE}`, { encoding: 'utf-8' });
  const osmParsed: GeoJson = JSON.parse(osmContent);

  const osmElementsFiltered = osmParsed.elements.filter(
    el => 
      el.tags.ref !== undefined
      && el.tags.operator === "İETT"
      && !linesCodesAdded.has(el.tags.ref.toString())
  )

  logger.info(`${osmElementsFiltered.length} osm lines to insert`)

  const elementsToInsert: DatabaseLine[] = osmElementsFiltered.map(el => ({
    city: "istanbul",
    code: el.tags.ref,
    title: el.tags.name,
  }))

  linesToInsert.push(...elementsToInsert)

  await sql`INSERT INTO lines ${sql(linesToInsert)}`
};

export const addLinesIzmir = async () => {
  const linesInDb = await sql`Select code FROM lines WHERE city = 'izmir'`;
  logger.info(`Got ${linesInDb.count} lines from database`);

  const linesInDbSet = new Set(linesInDb.map((line) => line.code));

  const content = await readFile(`${DATA_FOLDER}/izmir/${LINES_FILE}`, {
    encoding: "utf-8",
  });

  const lines: RawLine[] = parse(content, csvOptions).filter(
    (line: RawLine) => !linesInDbSet.has(line.HAT_NO.toString())
  );

  const linesTransformed: DatabaseLine[] = lines.map((line) => ({
    code: line.HAT_NO.toString(),
    title: line.HAT_ADI,
    city: "izmir",
  }));

  if (linesTransformed.length < 1) {
    logger.warn("No lines to add. Stopping");
    return;
  }

  logger.info(`Adding ${linesTransformed.length} lines to the database`);
  await sql`INSERT INTO lines ${sql(linesTransformed)}`;

  // Creating line routes
  logger.info("Creating default routes for every line");
  const defaultRoutes = lines
    .map((line) => {
      return [
        {
          agency_id: 1,
          route_short_name: line.HAT_NO,
          route_long_name: `${line.HAT_BASLANGIC} - ${line.HAT_BITIS}`,
          route_type: 3,
          route_code: `${line.HAT_NO}_G_D0`,
          city: "izmir",
        },
        {
          agency_id: 1,
          route_short_name: line.HAT_NO,
          route_long_name: `${line.HAT_BITIS} - ${line.HAT_BASLANGIC}`,
          route_type: 3,
          route_code: `${line.HAT_NO}_D_D0`,
          city: "izmir",
        },
      ];
    })
    .flat();

  logger.info(`Adding ${defaultRoutes.length} routes`);
  await sql`INSERT INTO routes ${sql(defaultRoutes)}`;

  const routePathContent = await readFile(`${DATA_FOLDER}/izmir/${LINE_ROUTE_PATHS_FILE}`, {
    encoding: "utf-8",
  });

  const routePaths: RawLineRoute[] = parse(routePathContent, csvOptions);

  const grouped = groupedByKey(routePaths, "HAT_NO");
  const paths = lines
    .map((line) => {
      const paths = grouped[line.HAT_NO] as RawLineRoute[]; // 1 G, 2 D

      const gRoutes: PathCoordinate[] = [];
      const dRoutes: PathCoordinate[] = [];

      for (let index = 0; index < paths.length; index++) {
        const element = paths[index];
        const formed = {
          lat: element.ENLEM,
          lng: element.BOYLAM,
        };

        if (element.YON === 1) {
          gRoutes.push(formed);
        } else if (element.YON === 2) {
          dRoutes.push(formed);
        }
      }

      return [
        {
          route_code: `${line.HAT_NO}_G_D0`,
          route_path: gRoutes,
          city: "izmir",
        },
        {
          route_code: `${line.HAT_NO}_D_D0`,
          route_path: dRoutes,
          city: "izmir",
        },
      ];
    })
    .flat();

  logger.info(`Got ${paths.length} route paths to insert database`);

  // @ts-expect-error
  const results = await sql`INSERT INTO route_paths ${sql(paths)}`;
  logger.info(`Inserted ${results.count} route paths to the database`);

  logger.info("izmir end");
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
