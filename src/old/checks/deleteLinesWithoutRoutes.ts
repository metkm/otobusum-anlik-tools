import { sql } from "../../db";

export const deleteLinesWithoutRoutes = async () => {
  const results = await sql`SELECT code FROM lines WHERE code NOT IN (SELECT route_short_name FROM routes)`;
  const codes = results.map(res => res.code)
  console.log(codes)

  // const deleteResult =
  //   await sql`DELETE FROM lines WHERE code NOT IN (SELECT route_short_name FROM routes)`;
  // console.log("deleted", deleteResult.count, "lines");
};

if (import.meta.main) {
  deleteLinesWithoutRoutes()
}
