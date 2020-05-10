const axios = require("axios").default;
const xmlparser = require("fast-xml-parser");
const moment = require("moment");
const proj4 = require("proj4");

proj4.defs(
  "EPSG:3879",
  "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

const transformGeometry = (geometry) => {
  const array = geometry.split(" ");
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

  const xsum = xs.reduce((acc, c) => acc + c, 0);
  const x = xsum / xs.length;

  const ysum = ys.reduce((acc, c) => acc + c, 0);
  const y = ysum / ys.length;

  return proj4("EPSG:3879", "WGS84", [x, y]);
};

axios
  .get(
    "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?request=getFeature&typename=Lyhyt_maanvuokraus_alue"
  )
  .then((resp) => {
    console.log("success");
    const json = xmlparser.parse(resp.data);

    const terassit = [];

    json["wfs:FeatureCollection"]["wfs:member"].forEach((item) => {
      if (
        item["avoindata:Lyhyt_maanvuokraus_alue"][
          "avoindata:hakemuksen_laji"
        ] === "Kesäterassi" ||
        item["avoindata:Lyhyt_maanvuokraus_alue"][
          "avoindata:hakemuksen_laji"
        ] === "Talviterassi" ||
        item["avoindata:Lyhyt_maanvuokraus_alue"][
          "avoindata:hakemuksen_laji"
        ] === "Parklet"
      ) {
        const startdate = moment(
          item["avoindata:Lyhyt_maanvuokraus_alue"]["avoindata:vuokraus_alkaa"]
        );
        const enddate = moment(
          item["avoindata:Lyhyt_maanvuokraus_alue"][
            "avoindata:vuokraus_paattyy"
          ]
        );

        const output = {
          id: item["avoindata:Lyhyt_maanvuokraus_alue"]["avoindata:id"],
          nimi: item["avoindata:Lyhyt_maanvuokraus_alue"]["avoindata:nimi"]
            .replace(/Terassialue: /, "")
            .replace(/Parklet-ruu[a-z]+ [0-9]+ m2 /, "")
            .replace("&amp;", "&")
            .replace(/ksen edustalla/, "s")
            .replace(/nun edustalla/, "tu")
            .replace(/din edustalla/, "d")
            .replace(/bin edustalla/, "b")
            .replace(/nin edustalla/, "n")
            .replace(/din edustalla/, "d")
            .replace(/\:n edustalla/, "")
            .replace(/n edustalla/, ""),
          tyyppi:
            item["avoindata:Lyhyt_maanvuokraus_alue"][
              "avoindata:hakemuksen_laji"
            ],
          osoite: item["avoindata:Lyhyt_maanvuokraus_alue"][
            "avoindata:osoite"
          ].replace(/ \(karttaliite\)/, ""),
          geometria: transformGeometry(
            item["avoindata:Lyhyt_maanvuokraus_alue"]["avoindata:singlegeom"][
              "gml:MultiSurface"
            ]["gml:surfaceMember"]["gml:Polygon"]["gml:exterior"][
              "gml:LinearRing"
            ]["gml:posList"]
          ),
          voimassa:
            startdate.isSameOrBefore("2020-05-10") &&
            enddate.isSameOrAfter("2020-05-10")
              ? true
              : false,
        };
        terassit.push(output);
      }
    });

    console.log(terassit);
  })
  .catch((err) => {
    console.log("error");
    console.log(err);
  });
