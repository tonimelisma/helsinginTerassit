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
  "6672649.4128385 2.549670750132153E7 6672648.30013362 2.549670589027001E7 6672638.71250725 2.549671248844145E7 6672639.825215 2.549671409949518E7 6672649.4128385 2.549670750132153E7"
);

console.log("yee");
console.log(x);
console.log(y);
