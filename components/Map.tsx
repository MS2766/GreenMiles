import MapView, { Marker } from "react-native-maps";
import { View } from "react-native";
import { useEffect, useState } from "react";
import React from "react";

interface MapProps {
  latitude: number;
  longitude: number;
}

export default function Map({ latitude, longitude }: MapProps) {
  const [region, setRegion] = useState({
    latitude: latitude || 0,
    longitude: longitude || 0,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      });
    }
  }, [latitude, longitude]);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ width: "100%", height: "100%" }} region={region}>
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
}
