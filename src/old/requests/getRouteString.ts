
interface RouteResponse {
  lineIcon: string
  lineColor: string
  line: string
}

export const getRouteString = async (routeCode: string) => {
  const response = await fetch(`https://iett.istanbul/tr/RouteStation/GetRoutePinV2?q=${routeCode}`, {
    method: "POST",
  });

  const parsed: RouteResponse[] = await response.json();
  return parsed
}
