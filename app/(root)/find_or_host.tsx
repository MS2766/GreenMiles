/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { Image } from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import React from "react";

const { height } = Dimensions.get("window");
const MIN_HEIGHT = 100;
const MID_HEIGHT = 400;
const MAX_HEIGHT = height * 0.8;

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

  // Initialize from and to with params if available
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

  const translateY = useSharedValue(height - MID_HEIGHT);
  const bottomSheetHeight = useSharedValue(MID_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => {
    bottomSheetHeight.value = height - translateY.value;
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startY: number }) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newY = ctx.startY + event.translationY;
      if (newY >= height - MAX_HEIGHT && newY <= height - MIN_HEIGHT) {
        translateY.value = newY;
      }
    },
    onEnd: () => {
      const currentY = translateY.value;
      if (currentY < height - MID_HEIGHT - 50) {
        translateY.value = withSpring(height - MAX_HEIGHT, { damping: 15 });
      } else if (currentY > height - MID_HEIGHT + 50) {
        translateY.value = withSpring(height - MIN_HEIGHT, { damping: 15 });
      } else {
        translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
      }
    },
  });

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

      // Use params from "Ride Again?" if provided
      if (fromLatitude && fromLongitude) {
        fromLat = parseFloat(fromLatitude as string);
        fromLng = parseFloat(fromLongitude as string);
        // Ensure from/to update with params
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
        setFrom("Current Location"); // Reset if no fromAddress
      }

      if (toLatitude && toLongitude) {
        toLat = parseFloat(toLatitude as string);
        toLng = parseFloat(toLongitude as string);
        setTo((toAddress as string) || ""); // Ensure to updates
      } else {
        toLat = null;
        toLng = null;
        setTo(""); // Reset if no toAddress
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

  // Animate bottom sheet to middle height on mount
  useEffect(() => {
    translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
  }, []);

  const handleEditFrom = () => {
    setIsEditingFrom(true);
    translateY.value = withSpring(height - MAX_HEIGHT, { damping: 15 });
  };

  const handleEditTo = () => {
    setIsEditingTo(true);
    translateY.value = withSpring(height - MAX_HEIGHT, { damping: 15 });
  };

  const onKeyboardDismiss = () => {
    if (isEditingFrom) {
      setIsEditingFrom(false);
    } else if (isEditingTo) {
      setIsEditingTo(false);
    }
    translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
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
    translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
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
    translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Finding route...</Text>
          </View>
        ) : (
          <>
            <Map
              markers={markers}
              routeCoords={routeCoords}
              bottomSheetHeight={bottomSheetHeight}
            />
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.bottomSheet, animatedStyle]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetContent}>
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
                    <TouchableOpacity
                      style={styles.locationRow}
                      onPress={handleEditFrom}
                    >
                      <Text style={styles.label} numberOfLines={1}>
                        From:
                      </Text>
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
                    <TouchableOpacity
                      style={styles.locationRow}
                      onPress={handleEditTo}
                    >
                      <Text style={styles.label} numberOfLines={1}>
                        To:
                      </Text>
                      <Text
                        style={styles.locationText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {to || "Enter destination"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleHostRide}
                  >
                    <Text style={styles.buttonText}>Host Ride</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleFindRide}
                  >
                    <Text style={styles.buttonText}>Find Ride</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </PanGestureHandler>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Image source={icons.backArrow} style={styles.backIcon} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    fontFamily: "Jakarta-Regular",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: MAX_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "#263238", // Changed to gray-800
  },
});
