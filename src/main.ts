import "dotenv/config";
import prompts from "prompts";
import { cityOptions, CityValues } from "./options";

import { addLineStops } from "./old/addLineStops";
import { getCredentials } from "./old/requests/getCredentials";
import { addLineRoutes } from "./old/addLineRoutes";
import { addBusRouteLineStrings } from "./old/addBusRouteLineStrings";

interface Choices {
  title: string;
  value: CityValues;
}

const citySelection = await prompts({
  type: "select",
  name: "city",
  message: "Select city",
  choices: [
    {
      title: "Istanbul",
      value: "istanbul",
    },
    {
      title: "Izmir",
      value: "izmir",
    },
  ] as Choices[],
});

const city = citySelection.city as CityValues;
const options = cityOptions[city];

await options.prepare();
await options.addLines();
// await options.addStops();
