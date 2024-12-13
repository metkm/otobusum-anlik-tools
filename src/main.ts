import "dotenv/config";
import { addLines } from "./addLines";
import { addLineStops } from "./addLineStops";
import { getCredentials } from "./requests/getCredentials";
import { addLineRoutes } from "./addLineRoutes";
import { addBusLineString } from "./addBusLineString";

console.log('gettings credentials')
await getCredentials()

console.log('addings lines')
await addLines()

console.log('adding line routes')
await addLineRoutes()

console.log('adding line stops')
await addLineStops()

console.log('adding bus lines')
await addBusLineString()
