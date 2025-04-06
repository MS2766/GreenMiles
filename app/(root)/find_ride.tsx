/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import RideLayout from "@/components/RideLayout";
import DriverCard from "@/components/DriverCard";
import { MarkerData } from "@/types/type";
import { icons } from "@/constants";
import axios from "axios";

const BASE_API_URL = process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000";
const API_URL = `${BASE_API_URL}/api/ride`;

export default function FindRide() {
  const params = useLocalSearchParams();
  const {
    fromAddress,
    fromLatitude,
    fromLongitude,
    toAddress,
    toLatitude,
    toLongitude,
  } = params;

  const [rides, setRides] = useState<MarkerData[]>([]);
  const [selectedRide, setSelectedRide] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  // Markers for the map
  const markers = [
    fromLatitude && fromLongitude
      ? {
          latitude: parseFloat(fromLatitude as string),
          longitude: parseFloat(fromLongitude as string),
          color: "blue",
        }
      : null,
    toLatitude && toLongitude
      ? {
          latitude: parseFloat(toLatitude as string),
          longitude: parseFloat(toLongitude as string),
          color: "red",
        }
      : null,
    ...rides.map((ride) => ({
      latitude: ride.latitude,
      longitude: ride.longitude,
      color: "green",
    })),
  ].filter(Boolean) as { latitude: number; longitude: number; color: string }[];

  // Fetch available rides
  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const fullUrl = `${API_URL}/search`;
      console.log("Fetching rides from:", fullUrl);
      const response = await axios.get(fullUrl, {
        params: {
          origin: fromAddress,
          destination: toAddress,
          fromLat: fromLatitude,
          fromLng: fromLongitude,
          toLat: toLatitude,
          toLng: toLongitude,
        },
      });

      const rideData = response.data.map((ride: any) => {
        const departureTime = new Date(ride.departure_time);
        const now = new Date();
        const timeDiffMinutes = Math.floor((departureTime - now) / 60000); // Minutes until departure

        return {
          id: ride.id,
          first_name: ride.driver_name?.split(" ")[0] || "Unknown",
          last_name: ride.driver_name?.split(" ")[1] || "Driver",
          latitude: parseFloat(fromLatitude as string), // Update with DB lat/lng if added
          longitude: parseFloat(fromLongitude as string),
          profile_image_url: "https://via.placeholder.com/150", // Add real image if available
          car_image_url: "https://via.placeholder.com/150",
          car_seats: ride.available_seats,
          rating: 4.5, // Fetch from DB or API if available
          title: ride.driver_name || "Unknown Driver",
          time: timeDiffMinutes > 0 ? timeDiffMinutes : 0, // Avoid negative times
          price: Number(ride.price).toFixed(2), // Ensure proper decimal format
        };
      });

      setRides(rideData);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch route
  const fetchRoute = async () => {
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

      const encodedPolyline = response.data.routes[0]?.polyline?.encodedPolyline;
      if (encodedPolyline) {
        const decodedCoords = decodePolyline(encodedPolyline);
        setRouteCoords(decodedCoords);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
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

  useEffect(() => {
    if (fromLatitude && fromLongitude && toLatitude && toLongitude) {
      fetchRoute();
      fetchRides();
    }
  }, [fromLatitude, fromLongitude, toLatitude, toLongitude]);

  const handleRideSelection = (rideId: number) => {
    setSelectedRide(rideId);
    router.push({
      pathname: "/(root)/ride-details",
      params: { 
        rideId: rideId.toString(), 
        fromAddress, 
        toAddress,
        fromLatitude,
        fromLongitude,
        toLatitude,
        toLongitude
      },
    });
  };

  const renderRideItem = ({ item }: { item: MarkerData }) => (
    <DriverCard
      item={item}
      selected={selectedRide ?? -1}
      setSelected={() => handleRideSelection(item.id)}
    />
  );

  return (
    <RideLayout markers={markers} routeCoords={routeCoords} isLoading={isLoading}>
      <View style={styles.locationContainer}>
        <Image source={icons.map} style={styles.icon} />
        <Text style={styles.locationText}>{fromAddress || "Not set"}</Text>
      </View>
      <View style={styles.locationContainer}>
        <Image source={icons.target} style={styles.icon} />
        <Text style={styles.locationText}>{toAddress || "Not set"}</Text>
      </View>

      {rides.length === 0 ? (
        <Text style={styles.noRides}>
          {isLoading ? "Searching for rides..." : "No rides available yet."}
        </Text>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.rideList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </RideLayout>
  );
}

const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationText: {
    fontFamily: "PlusJakartaSans-Regular",
    color: "#1F2937",
    fontSize: 16,
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  noRides: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  rideList: {
    paddingBottom: 20,
  },
});