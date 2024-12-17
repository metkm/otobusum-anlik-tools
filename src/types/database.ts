export interface Route {
  id?: number
  agency_id: number
  route_short_name: string
  route_long_name: string
  route_type: number
  route_desc?: string
  route_code: string
}

export interface PathCoordinate {
  lat: number,
  lng: number
}

export interface RoutePath {
  route_code: string
  route_path: PathCoordinate[]
}
