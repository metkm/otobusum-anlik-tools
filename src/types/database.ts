export interface DatabaseRoute {
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

export interface DatabaseStop {
  stop_code: number
  stop_name: string
  x_coord: number
  y_coord: number
  smart?: string
  physical?: string
  stop_type?: string
  disabled_can_use?: string
  city: string
}
