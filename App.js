import React, { useState, useEffect } from "react";
import { StatusBar, StyleSheet, Text, View, Dimensions } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";

import * as Analytics from "expo-firebase-analytics";

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

const HomeScreen = () => {
  const [location, setLocation] = useState({
    latitude: 60.169297,
    longitude: 24.938435,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  const [terassit, setTerassit] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      // if (status !== 'granted') {
      //  setErrorMsg('Permission to access location was denied');
      // }

      let location = await Location.getCurrentPositionAsync({});
      Analytics.setDebugModeEnabled(true)
        .then((res) => {
          console.log("enabled debugoco");
          console.lod(res);
        })
        .catch((err) => {
          console.log("couldn't debug");
          console.log(err);
        });
      Analytics.logEvent("getCurrentPositionAsync", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
        .then((res) => {
          console.log("successfully logged event");
          console.log(res);
        })
        .catch((err) => {
          console.log("logevent error");
          console.log(err);
        });
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    })();
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?request=getFeature&typename=Lyhyt_maanvuokraus_alue"
      )
      .then((resp) => {
        const json = xmlparser.parse(resp.data);

        const uudetTerassit = [];

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
              item["avoindata:Lyhyt_maanvuokraus_alue"][
                "avoindata:vuokraus_alkaa"
              ]
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
                item["avoindata:Lyhyt_maanvuokraus_alue"][
                  "avoindata:singlegeom"
                ]["gml:MultiSurface"]["gml:surfaceMember"]["gml:Polygon"][
                  "gml:exterior"
                ]["gml:LinearRing"]["gml:posList"]
              ),
              voimassa:
                startdate.isSameOrBefore() && enddate.isSameOrAfter()
                  ? true
                  : false,
            };

            if (
              !uudetTerassit.find(
                (element) =>
                  element.geometria[0].toFixed(2) ===
                    output.geometria[0].toFixed(2) &&
                  element.geometria[1].toFixed(2) ===
                    output.geometria[1].toFixed(2) &&
                  element.nimi.replace(/\W/g, "") ===
                    output.nimi.replace(/\W/g, "")
              )
            ) {
              uudetTerassit.push(output);
            }
          }
        });

        setTerassit(uudetTerassit);
      })
      .catch((err) => {
        console.log("error");
        console.log(err);
      });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView style={styles.mapStyle} region={location}>
        {terassit.length ? (
          terassit
            .filter((terde) => terde.voimassa)
            .map((marker) => (
              <Marker
                key={marker.id}
                title={marker.nimi}
                description={marker.osoite}
                pinColor={marker.voimassa ? "red" : "gray"}
                coordinate={{
                  latitude: marker.geometria[1],
                  longitude: marker.geometria[0],
                }}
              >
                <Callout>
                  <Text style={{ fontWeight: "bold" }}>{marker.nimi}</Text>
                  <Text>{marker.tyyppi}</Text>
                  <Text>{marker.osoite}</Text>
                </Callout>
              </Marker>
            ))
        ) : (
          <></>
        )}
        <Marker coordinate={location} pinColor="blue" />
      </MapView>
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
      /*screenOptions={{
          headerStyle: {
            backgroundColor: "#dddddd",
          },
          headerTintColor: "#222244",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }} */
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Helsingin terassit",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default App;
