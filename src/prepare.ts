import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import CliProgress from "cli-progress";
import ky from "ky";

import { logger } from "./db";
import { CityValues } from "./options";
import {
  DATA_FOLDER,
  LINES_FILE,
  LINES_GEOJSON_FILE,
  LINE_ROUTES_FILE,
  LINE_ROUTE_PATHS_FILE,
  STOPS_FILE,
} from "./constants";
import { formatBytes } from "./utils";

interface File {
  url: string;
  title: string;
  body?: string;
  method?: string;
}

const filesToDownload: Record<CityValues, File[]> = {
  istanbul: [
    {
      title: LINES_GEOJSON_FILE,
      url: `https://www.overpass-api.de/api/interpreter?data=${encodeURIComponent(`
        [out:json][timeout:25];
        area[name="İstanbul"]->.ist;
        relation["type"="route"]["route"="bus"](area.ist);
        out meta;
      `)}`,
      method: "POST",
    },
    {
      title: LINE_ROUTES_FILE,
      url: "https://data.ibb.gov.tr/dataset/8540e256-6df5-4719-85bc-e64e91508ede/resource/46dbe388-c8c2-45c4-ac72-c06953de56a2/download/routes.csv",
    },
  ],
  izmir: [
    {
      title: LINES_FILE,
      url: "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hatlari.csv",
    },
    {
      title: LINE_ROUTE_PATHS_FILE,
      url: "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hat-guzergahlari.csv",
    },
    {
      title: STOPS_FILE,
      url: "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-duraklari.csv",
    },
  ],
};

const prepareFiles = async (targetCity: CityValues) => {
  const targetCityFolder = `${DATA_FOLDER}/${targetCity}`;

  if (!existsSync(DATA_FOLDER)) {
    mkdirSync(`./data`);
  }

  if (!existsSync(targetCityFolder)) {
    mkdirSync(targetCityFolder);
  }

  const files = filesToDownload[targetCity].filter((file) => {
    const fileExists = existsSync(`${targetCityFolder}/${file.title}`);
    if (fileExists) {
      logger.info(`${file.title}.csv exists. Skipping`);
    }

    return !fileExists;
  });

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    const bar = new CliProgress.SingleBar({
      format: `Downloading [{bar}] ${file.title} - downloaded {transferredBytes}`,
    });

    bar.start(100, 0);

    try {
      const response = await ky(file.url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        onDownloadProgress: (progress) => {
          bar.update(progress.percent, {
            transferredBytes: formatBytes(progress.transferredBytes),
          });
        },
      });

      bar.update(100);
      const bytes = await response.bytes();

      try {
        await writeFile(`${targetCityFolder}/${file.title}`, bytes);
      } catch (error) {
        logger.error(`Error writing data file ${error.message}`);
      }
    } catch (error) {
      logger.error(error.message);
    } finally {
      bar.stop();
    }
  }
};

export const prepareIstanbul = async () => {
  await prepareFiles("istanbul");
};

export const prepareIzmir = async () => {
  await prepareFiles("izmir");
};
