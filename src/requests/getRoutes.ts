interface Route {
  GUZERGAH_DEPAR_NO: number
  GUZERGAH_GUZERGAH_ADI: string
  GUZERGAH_DEPAR_ISARETI: string |  null
  GUZERGAH_GUZERGAH_KODU: string
  GUZERGAH_ID: number
  GUZERGAH_YOLCU_GUZERGAH_ADI: string
  GUZERGAH_YON: number
  HAT_HAT_ADI: string
  HAT_HAT_KODU: string
  HAT_ID: number
}

export const getRoutes = async (lineCode: string) => {
  const body = {
    alias: "mainGetLine_basic",
    data: {
      "HATYONETIM.HAT.HAT_KODU": lineCode,
    },
  };

  const response = await fetch("https://ntcapi.iett.istanbul/service", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization:
        `Bearer ${process.env.BEARER}`,
    },
  });

  const parsed: Route[] = await response.json();
  return parsed
};
