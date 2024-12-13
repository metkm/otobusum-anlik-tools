import { authHeaders } from "./getCredentials";

export interface Stop {
  DURAK_ADI: string;
  DURAK_DURAK_KISA_ADI: string;
  DURAK_DURAK_KODU: number;
  DURAK_GEOLOC: GeoLocation;
  DURAK_ID: number;
  DURAK_YON_BILGISI: string;
  GUZERGAH_DEPAR_NO: number;
  GUZERGAH_GUZERGAH_KODU: string;
  GUZERGAH_SEGMENT_SIRA: number;
  GUZERGAH_YON: number;
  HAT_HAT_KODU: string;
  HAT_ID: number;
  ILCELER_ILCEADI: string;
  ILCELER_TUIK_ILCE_KODU: number;
}

export interface GeoLocation {
  x: number;
  y: number;
}

export const getStops = async (lineCode: string) => {
  const body = {
    alias: "mainGetRoute",
    data: {
      "HATYONETIM.HAT.HAT_KODU": lineCode,
    },
  };

  const response = await fetch("https://ntcapi.iett.istanbul/service", {
    method: "POST",
    body: JSON.stringify(body),
    headers: authHeaders
  });

  const parsed: Stop[] = await response.json();
  return parsed
};
