const proj4 = require("proj4");

proj4.defs(
  "EPSG:3879",
  "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

const transformGeometry = (geometry) => {
  const array = geometry.split(" ");
  console.log(array);
  const xs = [],
    ys = [];
  array.forEach((item, index) => {
    if (!(index % 2)) {
      ys.push(parseFloat(item));
    } else {
      xs.push(parseFloat(item));
    }
  });

  xs.pop();
  ys.pop();
  console.log("xs:");
  console.log(xs);
  console.log("ys:");
  console.log(ys);

  const xsum = xs.reduce((acc, c) => acc + c, 0);
  const x = xsum / xs.length;

  const ysum = ys.reduce((acc, c) => acc + c, 0);
  const y = ysum / ys.length;

  return proj4("EPSG:3879", "WGS84", [x, y]);
};

const [x, y] = transformGeometry(
  "6674309 2.5495155E7 6674309.624 2.5495154934E7 6674310.22 2.5495154741E7 6674310.763 2.5495154427E7 6674311.229 2.5495154007E7 6674311.598 2.54951535E7 6674311.853 2.5495152927E7 6674311.984 2.5495152314E7 6674311.984 2.5495151686E7 6674311.853 2.5495151073E7 6674311.598 2.54951505E7 6674311.229 2.5495149993E7 6674310.763 2.5495149573E7 6674310.22 2.5495149259E7 6674309.624 2.5495149066E7 6674309 2.5495149E7 6674308.376 2.5495149066E7 6674307.78 2.5495149259E7 6674307.237 2.5495149573E7 6674306.771 2.5495149993E7 6674306.402 2.54951505E7 6674306.147 2.5495151073E7 6674306.016 2.5495151686E7 6674306.016 2.5495152314E7 6674306.147 2.5495152927E7 6674306.402 2.54951535E7 6674306.771 2.5495154007E7 6674307.237 2.5495154427E7 6674307.78 2.5495154741E7 6674309 2.5495155E7"
);

console.log("yee");
console.log(x);
console.log(y);

const [x2, y2] = transformGeometry("6674441 2.54950345E7 6674440 2.549503175E7 6674437.25 2.549503375E7 6674437 2.549503575E7 6674441 2.54950345E7")

console.log("afaf")
console.log(x2)
console.log(y2)
