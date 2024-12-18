export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const groupedByKey = <T>(data: T[], key: keyof T) => {
  let result = {} as Record<keyof T, T[]>;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const keyValue = item[key];

    // @ts-ignore
    if (result[keyValue]) {
      // @ts-ignore
      result[keyValue].push(item);
    } else {
      // @ts-ignore
      result[keyValue] = [item];
    }
  }

  return result;
};
