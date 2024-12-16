import { addLinesIstanbul, addLinesIzmir } from "./addLines";
import { prepareIstanbul, prepareIzmir } from "./prepare";

export type CityValues = "istanbul" | "izmir";

interface Option {}

export const cityOptions = {
  istanbul: {
    prepare: prepareIstanbul,
    addLines: addLinesIstanbul,
  },
  izmir: {
    prepare: prepareIzmir,
    addLines: addLinesIzmir,
  },
} satisfies Record<CityValues, Option>;
