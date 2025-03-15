import MapView, { Marker, Region, Polyline } from "react-native-maps";
import { View } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { SharedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import React from "react";

export interface MarkerData {
  latitude: number;
  longitude: number;
  color?: string;
}

export interface MapProps {
  markers: MarkerData[];
  routeCoords?: { latitude: number; longitude: number }[];
  bottomSheetHeight?: SharedValue<number>;
}

export default function Map({
  markers,
  routeCoords = [],
  bottomSheetHeight,
}: MapProps) {
  const [region, setRegion] = useState<Region | null>(null);

  const updateRegion = useCallback(
    (sheetHeight: number): void => {
      const baseRegion = calculateBaseRegion(markers);
      const screenHeight = Dimensions.get("window").height;
      const visibleHeight = screenHeight - sheetHeight;
      const latitudeOffset =
        (baseRegion.latitudeDelta * (sheetHeight / visibleHeight)) / 2;

      const newRegion = {
        ...baseRegion,
        latitude: baseRegion.latitude - latitudeOffset,
      };
      setRegion(newRegion);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers],
  );

  // Calculate base region based on markers
  const calculateBaseRegion = useCallback((markers: MarkerData[]): Region => {
    if (markers.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    if (markers.length === 1) {
      return {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      };
    }

    const latitudes = markers.map((m) => m.latitude);
    const longitudes = markers.map((m) => m.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) * 1.5,
      longitudeDelta: Math.abs(maxLng - minLng) * 1.5,
    };
  }, []);

  // Set initial region
  useEffect(() => {
    if (markers.length === 0) return;

    if (!bottomSheetHeight) {
      setRegion(calculateBaseRegion(markers));
    } else {
      updateRegion(bottomSheetHeight.value);
    }
  }, [markers, bottomSheetHeight, calculateBaseRegion, updateRegion]);

  useAnimatedReaction(
    () => bottomSheetHeight?.value,
    (currentHeight) => {
      if (currentHeight !== undefined && markers.length > 0) {
        runOnJS(updateRegion)(currentHeight);
      }
    },
    [markers],
  );

  return (
    <View style={{ flex: 1 }}>
      {region && (
        <MapView style={{ width: "100%", height: "100%" }} region={region}>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              pinColor={marker.color || "red"}
            />
          ))}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#0000FF"
              strokeWidth={3}
            />
          )}
        </MapView>
      )}
    </View>
  );
}
