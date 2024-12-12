const file = Bun.file("./query_ist.geojson");
const osmQuery = await file.json();

export const busLineFeatures = osmQuery.features.filter(
  (f) =>
    !!f.properties.ref &&
    f.properties["@id"].includes("relation") &&
    f.properties.network === "İETT"
);
