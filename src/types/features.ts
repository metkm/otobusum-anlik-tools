export interface Properties {
  "@id": string;
  from: string;
  name: string;
  network: string;
  "network:wikidata": string;
  operator: string;
  ref: string;
  route: string;
  to: string;
  type: string;
  "@timestamp"?: string;
  "@version"?: string;
  "@changeset"?: string;
  "@user"?: string;
  "@uid"?: string;
}

export interface Geometry {
  type: "MultiLineString";
  coordinates: Array<Array<[number, number]>>;
}

export interface LineFeature {
  id: string;
  type: "Feature";
  properties: Properties;
  geometry: Geometry;
}
