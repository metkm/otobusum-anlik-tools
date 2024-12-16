import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import CliProgress from "cli-progress";
import ky from "ky";

import { logger } from "./db";
import { CityValues } from "./cityOptions";
import { DATA_FOLDER, LINES_FILE, ROUTES_FILE } from "./constants";

interface File {
  url: string;
  title: string;
}

const filesToDownload: Record<CityValues, File[]> = {
  istanbul: [],
  izmir: [
    {
      title: LINES_FILE,
      url: "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hatlari.csv",
    },
    {
      title: ROUTES_FILE,
      url: "https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hat-guzergahlari.csv",
    },
  ],
};

const prepareFiles = async (targetCity: CityValues) => {
  const targetCityFolder = `${DATA_FOLDER}/${targetCity}`;
  const dataFolderExists = existsSync(targetCityFolder);

  if (!dataFolderExists) {
    mkdirSync(`./data`);
    mkdirSync(targetCityFolder);
  }

  const files = filesToDownload[targetCity].filter((file) => {
    const fileExists = existsSync(`${targetCityFolder}/${file.title}.csv`);
    if (fileExists) {
      logger.info(`${file.title}.csv exists. Skipping`);
    }

    return !fileExists;
  });

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    const bar = new CliProgress.SingleBar({
      format: `Downloading [{bar}] ${file.title} - {value}% / {total}%`,
    });

    bar.start(100, 0);
    const response = await ky(file.url, {
      onDownloadProgress: (progress) => {
        bar.update(progress.percent);
      },
    });

    bar.update(100);
    bar.stop();

    const bytes = await response.bytes();

    try {
      await writeFile(`${targetCityFolder}/${file.title}.csv`, bytes);
    } catch (error) {
      logger.error(`Error writing data file ${error.message}`);
    }
  }
};

export const prepareIstanbul = async () => {
  await prepareFiles("istanbul");
};

export const prepareIzmir = async () => {
  await prepareFiles("izmir");
};
