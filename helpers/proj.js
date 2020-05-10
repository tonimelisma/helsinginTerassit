const proj4 = require("proj4");

proj4.defs(
  "EPSG:3879",
  "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

const doner = [
  parseFloat("6675096.7645598"),
  parseFloat("2.549739761988252e7"),
];

const doner2 = [
  parseFloat("2.549739761988252e7"),
  parseFloat("6675096.7645598"),
];

console.log("döner harju: ");

try {
  console.log(doner);
  const diipa = proj4("EPSG:3879", "WGS84", doner);
  console.log("dafa");
  console.log(diipa);
  console.log("\n")
  console.log(doner2);
  const diipa2 = proj4("EPSG:3879", "WGS84", doner2);
  console.log("dafa");
  console.log(diipa2);
} catch (e) {
  console.log("errorr");
  console.log(e);
}
