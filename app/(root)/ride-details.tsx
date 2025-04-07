/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform, // Added import
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Map, { MarkerData } from "@/components/Map";

// Update the BASE_API_URL to match your ngrok URL
const BASE_API_URL = "https://b858-103-208-231-221.ngrok-free.app";
const API_URL = `${BASE_API_URL}/api/ride`;

interface RideDetails {
  id: number;
  driver_name: string;
  rating?: number;
  price: number;
  estimated_time?: number;
  available_seats: number;
  departure_time: string;
  origin_address?: string;
  destination_address?: string;
}

const RideDetails = () => {
  const {
    rideId,
    fromAddress,
    toAddress,
    fromLatitude,
    fromLongitude,
    toLatitude,
    toLongitude,
  } = useLocalSearchParams();
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  // Fetch ride details and route
  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${rideId}`);
        console.log("Fetched ride details:", response.data); // Debug log
        setRide(response.data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
        Alert.alert("Error", "Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };

    const fetchRoute = async () => {
      if (fromLatitude && fromLongitude && toLatitude && toLongitude) {
        try {
          const response = await axios.post(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
              origin: {
                location: {
                  latLng: {
                    latitude: parseFloat(fromLatitude as string),
                    longitude: parseFloat(fromLongitude as string),
                  },
                },
              },
              destination: {
                location: {
                  latLng: {
                    latitude: parseFloat(toLatitude as string),
                    longitude: parseFloat(toLongitude as string),
                  },
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
        }
      }
    };

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

    if (rideId) {
      fetchRideDetails();
      fetchRoute();
      // Set markers based on params
      const initialMarkers = [
        {
          latitude: parseFloat(fromLatitude as string) || 0,
          longitude: parseFloat(fromLongitude as string) || 0,
          color: "blue",
        },
      ];
      if (toLatitude && toLongitude) {
        initialMarkers.push({
          latitude: parseFloat(toLatitude as string),
          longitude: parseFloat(toLongitude as string),
          color: "red",
        });
      }
      setMarkers(initialMarkers);
    }
  }, [rideId, fromLatitude, fromLongitude, toLatitude, toLongitude]);

  const handleConfirm = () => {
    Alert.alert(
      "Confirmation",
      "Ride booked successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            router.push("/(root)/(tabs)/rides");
          },
        },
      ],
      { cancelable: false },
    );
  };

  // Render loading state or ride details with map
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Ride not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Ride Details</Text>

        {/* Section: Route Details with Map */}
        <View style={styles.section}>
          <View style={styles.mapContainer}>
            <Map
              markers={markers}
              routeCoords={routeCoords}
              bottomSheetHeight={undefined}
            />
          </View>
        </View>

        {/* Section: Ride Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Information</Text>
          <Text style={styles.detail}>
            Driver: {ride?.driver_name || "Unknown Driver"}
          </Text>
          <Text style={styles.detail}>
            Rating: {ride?.rating?.toFixed(1) || "4.5"} ★
          </Text>
          <Text style={styles.detail}>
            Price: ${typeof ride?.price === "number" ? ride.price.toFixed(2) : "N/A"}
          </Text>
          <Text style={styles.detail}>
            Estimated Time: {ride?.estimated_time || "N/A"} min
          </Text>
          <Text style={styles.detail}>
            Seats Available: {ride?.available_seats || "N/A"}
          </Text>
          <Text style={styles.detail}>
            Departure: {ride?.departure_time ? new Date(ride.departure_time).toLocaleString() : "N/A"}
          </Text>
          <Text style={styles.detail}>
            From: {fromAddress || "Unknown"}
          </Text>
          <Text style={styles.detail}>
            To: {toAddress || "Unknown"}
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Confirming..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#263238",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#37474f",
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  detail: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#1F2937",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#263238",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#b0bec5",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
});

export default RideDetails;