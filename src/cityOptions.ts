import { Options } from "csv-parse";
import { addLinesIstanbul, addLinesIzmir } from "./addLines";
import { prepareIstanbul, prepareIzmir } from "./prepare";
import { addStopsIstanbul, addStopsIzmir } from "./addStops";

export type CityValues = "istanbul" | "izmir";

interface Option {}

export const csvOptions: Options = {
  trim: true,
  cast: true,
  delimiter: ";",
  columns: true,
};

export const cityOptions = {
  istanbul: {
    prepare: prepareIstanbul,
    addLines: addLinesIstanbul,
    addStops: addStopsIstanbul,
  },
  izmir: {
    prepare: prepareIzmir,
    addLines: addLinesIzmir,
    addStops: addStopsIzmir,
  },
} satisfies Record<CityValues, Option>;
