import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useState } from "react";
import React from "react";
import RideLayout from "@/components/RideLayout";
import DriverCard from "@/components/DriverCard";
import { MarkerData } from "@/types/type";
import { icons } from "@/constants";

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

  // Sample ride data (replace with actual API call later)
  const [rides, setRides] = useState<MarkerData[]>([
    {
      id: 1,
      first_name: "David",
      last_name: "Brown",
      latitude: parseFloat(fromLatitude as string) || 37.7749, // Default fallback
      longitude: parseFloat(fromLongitude as string) || -122.4194,
      profile_image_url:
        "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      car_seats: 5,
      rating: 4.6,
      title: "David Brown",
      time: 391,
      price: "19.50",
    },
    {
      id: 2,
      first_name: "John",
      last_name: "Leason",
      latitude: parseFloat(fromLatitude as string) || 37.7859, // Slightly different default
      longitude: parseFloat(fromLongitude as string) || -122.4364,
      profile_image_url:
        "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: 4.8,
      title: "John Leason",
      time: 491,
      price: "24.50",
    },
  ]);
  const [selectedRide, setSelectedRide] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      color: "green", // Drivers in green
    })),
  ].filter(Boolean) as { latitude: number; longitude: number; color: string }[];

  const handleSearch = async () => {
    setIsLoading(true);
    console.log("Searching rides from:", fromAddress, "to:", toAddress);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(
      //   `https://your-api.com/rides?from=${encodeURIComponent(fromAddress as string)}&to=${encodeURIComponent(toAddress as string)}`
      // );
      // const data = await response.json();
      // setRides(data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRideSelection = (rideId: number) => {
    setSelectedRide(rideId);
    router.push({
      pathname: "/(root)/ride-details",
      params: { rideId: rideId.toString(), fromAddress, toAddress },
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
    <RideLayout markers={markers} isLoading={isLoading}>
      <View style={styles.locationContainer} className="flex-row">
        <Image source={icons.map} className="w-5 h-5 mt-1 mr-2" />
        <Text style={styles.locationText}>{fromAddress || "Not set"}</Text>
      </View>
      <View style={styles.locationContainer} className="flex-row">
        <Image source={icons.target} className="w-5 h-5 mt-1 mr-2" />
        <Text style={styles.locationText}>{toAddress || "Not set"}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          !fromAddress || !toAddress ? styles.buttonDisabled : null,
        ]}
        onPress={handleSearch}
        disabled={!fromAddress || !toAddress}
      >
        <Text style={styles.buttonText}>Search Rides</Text>
      </TouchableOpacity>

      {rides.length === 0 ? (
        <Text style={styles.noRides}>No rides available yet.</Text>
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
  title: {
    fontSize: 26,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#202124",
    marginBottom: 16,
    textAlign: "center",
  },
  locationContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Medium",
    color: "#4B5563",
    marginBottom: 8,
  },
  locationText: {
    fontFamily: "PlusJakartaSans-Regular",
    color: "#1F2937",
  },
  button: {
    backgroundColor: "#263238",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
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
