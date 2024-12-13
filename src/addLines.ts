import { sql } from "./db";
import { busLineFeatures } from './osm/getAllOsmLines'

const routes = Bun.file('./routes.csv', {  })
const routesText = await routes.text()

interface Line {
  code: string
  title: string
}

export const addLines = async () => {
  const routeLine = routesText.split('\n')
  const linesInDb = await sql`SELECT code FROM lines`;
  console.log('got', linesInDb.count, 'from db')

  const routeLines: Line[] = []
  const addedLines = new Set(linesInDb.map(x => x.code))

  for (let index = 1; index < routeLine.length; index++) {
    const element = routeLine[index];
    if (element.startsWith(`"`)) {
      console.log('skipping index', index)
      continue
    }
    
    const [
      route_id,
      agency_id,
      route_short_name,
      route_long_name,
      route_type,
      route_desc,
      route_code
    ] = element.split(',')

    if (!route_short_name || !route_long_name) {
      console.log('skipping index', index)
      continue
    }

    if (addedLines.has(route_short_name)) {
      console.log(route_short_name, 'already added. Skipping')
      continue
    }

    routeLines.push({
      code: route_short_name,
      title: route_long_name
    })

    addedLines.add(route_short_name)
  }

  console.log('found', routeLine.length, 'lines inside routes.csv. Checking osm now.')

  const refs: Line[] = busLineFeatures.map(feature => ({
    code: feature.properties.ref,
    title: feature.properties.name
  }))

  const refsFiltered = refs.filter(ref => !addedLines.has(ref.code))
  console.log('found', refsFiltered.length, 'lines in osm file that are not in routes csv')
  
  routeLines.push(...refsFiltered)
  console.log('adding', routeLines.length, 'lines to the db..')

  if (routeLines.length < 1) return

  const results = await sql`INSERT INTO lines ${sql(routeLines)}`
  console.log('added record count', results.count)
}

if (import.meta.main) {
  addLines()
}
