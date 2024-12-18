export interface Member {
  type: string
  ref: number
  role: string
}

export interface Tags {
  description:  string
  from: string
  name: string
  network: string
  operator: string
  ref: string
  roundtrip: string
  route: string
  type: string
  to: string
}

export interface Element {
  type: string;
  id: string
  timestamp: string
  version: string
  user: string
  uid: number
  members: Member[]
  tags: Tags
}


export interface GeoJson {
  version: number;
  generator: string;
  elements: Element[];
}
