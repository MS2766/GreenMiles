/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import RideLayout from "@/components/RideLayout";
import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import axios from "axios";
import * as Location from "expo-location";
import React from "react";

export default function FindOrHost() {
  const params = useLocalSearchParams();
  const {
    fromAddress,
    fromLatitude,
    fromLongitude,
    toAddress,
    toLatitude,
    toLongitude,
  } = params;

  const [from, setFrom] = useState(
    (fromAddress as string) || "Current Location",
  );
  const [to, setTo] = useState((toAddress as string) || "");
  const [markers, setMarkers] = useState<
    { latitude: number; longitude: number; color: string }[]
  >([]);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [isEditingFrom, setIsEditingFrom] = useState(false);
  const [isEditingTo, setIsEditingTo] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch route from Google Maps Routes API
  const fetchRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ) => {
    try {
      const response = await axios.post(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.lng },
            },
          },
          destination: {
            location: {
              latLng: { latitude: destination.lat, longitude: destination.lng },
            },
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.EXPO_PUBLIC_STATIC_MAPS_KEY || "",
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
          },
        },
      );

      const encodedPolyline =
        response.data.routes[0]?.polyline?.encodedPolyline;
      if (encodedPolyline) {
        const decodedCoords = decodePolyline(encodedPolyline);
        setRouteCoords(decodedCoords);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Decode Google's encoded polyline
  const decodePolyline = (encoded: string) => {
    let points: { latitude: number; longitude: number }[] = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  // Set initial state with params or user location
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let fromLat: number,
        fromLng: number,
        toLat: number | null,
        toLng: number | null;

      if (fromLatitude && fromLongitude) {
        fromLat = parseFloat(fromLatitude as string);
        fromLng = parseFloat(fromLongitude as string);
        setFrom((fromAddress as string) || "Current Location");
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          setIsLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        fromLat = loc.coords.latitude;
        fromLng = loc.coords.longitude;
        setFrom("Current Location");
      }

      if (toLatitude && toLongitude) {
        toLat = parseFloat(toLatitude as string);
        toLng = parseFloat(toLongitude as string);
        setTo((toAddress as string) || "");
      } else {
        toLat = null;
        toLng = null;
        setTo("");
      }

      const initialMarkers = [
        { latitude: fromLat, longitude: fromLng, color: "blue" },
      ];
      if (toLat && toLng) {
        initialMarkers.push({
          latitude: toLat,
          longitude: toLng,
          color: "red",
        });
      }
      setMarkers(initialMarkers);

      if (toLat && toLng) {
        await fetchRoute(
          { lat: fromLat, lng: fromLng },
          { lat: toLat, lng: toLng },
        );
      } else {
        setIsLoading(false);
      }
    })();
  }, [
    fromLatitude,
    fromLongitude,
    toLatitude,
    toLongitude,
    fromAddress,
    toAddress,
  ]);

  const handleEditFrom = () => {
    setIsEditingFrom(true);
  };

  const handleEditTo = () => {
    setIsEditingTo(true);
  };

  const onKeyboardDismiss = () => {
    if (isEditingFrom) {
      setIsEditingFrom(false);
    } else if (isEditingTo) {
      setIsEditingTo(false);
    }
  };

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDismiss,
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isEditingFrom, isEditingTo]);

  const handleFromSelected = (placeData: {
    description: string;
    latitude: number;
    longitude: number;
  }) => {
    setFrom(placeData.description);
    const newMarkers = [
      {
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        color: "blue",
      },
      ...(markers.length > 1 ? [markers[1]] : []),
    ];
    setMarkers(newMarkers);
    setIsEditingFrom(false);
    if (newMarkers.length === 2) {
      fetchRoute(
        { lat: newMarkers[0].latitude, lng: newMarkers[0].longitude },
        { lat: newMarkers[1].latitude, lng: newMarkers[1].longitude },
      );
    }
  };

  const handleToSelected = (placeData: {
    description: string;
    latitude: number;
    longitude: number;
  }) => {
    setTo(placeData.description);
    const newMarkers = [
      markers[0] || {
        latitude: userLocation?.latitude || 0,
        longitude: userLocation?.longitude || 0,
        color: "blue",
      },
      {
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        color: "red",
      },
    ];
    setMarkers(newMarkers);
    setIsEditingTo(false);
    if (newMarkers[0].latitude && newMarkers[1].latitude) {
      fetchRoute(
        { lat: newMarkers[0].latitude, lng: newMarkers[0].longitude },
        { lat: newMarkers[1].latitude, lng: newMarkers[1].longitude },
      );
    }
  };

  const handleHostRide = () => {
    router.push({
      pathname: "/(root)/host_ride",
      params: {
        fromAddress,
        fromLatitude,
        fromLongitude,
        toAddress,
        toLatitude,
        toLongitude,
      },
    });
  };

  const handleFindRide = () => {
    router.push({
      pathname: "/(root)/find_ride",
      params: {
        fromAddress,
        fromLatitude,
        fromLongitude,
        toAddress,
        toLatitude,
        toLongitude,
      },
    });
  };

  return (
    <RideLayout
      markers={markers}
      routeCoords={routeCoords}
      isLoading={isLoading}
    >
      {isEditingFrom ? (
        <GoogleTextInput
          icon={icons.point}
          containerStyle={styles.inputContainer}
          userLocation={
            userLocation || {
              latitude: markers[0]?.latitude || 0,
              longitude: markers[0]?.longitude || 0,
            }
          }
          onPlaceSelected={handleFromSelected}
        />
      ) : (
        <TouchableOpacity style={styles.locationRow} onPress={handleEditFrom}>
          <Image
            source={icons.map}
            style={{ width: 20, height: 20, marginTop: 4, marginRight: 8 }}
          />
          <Text
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {from}
          </Text>
        </TouchableOpacity>
      )}
      {isEditingTo ? (
        <GoogleTextInput
          icon={icons.point}
          containerStyle={styles.inputContainer}
          userLocation={
            userLocation || {
              latitude: markers[0]?.latitude || 0,
              longitude: markers[0]?.longitude || 0,
            }
          }
          onPlaceSelected={handleToSelected}
        />
      ) : (
        <TouchableOpacity style={styles.locationRow} onPress={handleEditTo}>
          <Image
            source={icons.target}
            style={{ width: 20, height: 20, marginTop: 4, marginRight: 8 }}
          />
          <Text
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {to || "Enter destination"}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={handleHostRide}>
        <Text style={styles.buttonText}>Host Ride</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleFindRide}>
        <Text style={styles.buttonText}>Find Ride</Text>
      </TouchableOpacity>
    </RideLayout>
  );
}

const styles = StyleSheet.create({
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: "Jakarta-Bold",
    color: "#202124",
    width: 60,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#263238",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Jakarta-Regular",
    color: "#555",
    flex: 1,
  },
  inputContainer: {
    marginBottom: 10,
  },
});
