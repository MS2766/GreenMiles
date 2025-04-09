/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Text, SafeAreaView, FlatList, View, StyleSheet, Alert } from "react-native";
import axios from "axios";
import RideCard from "@/components/RideCard"; // Adjust the import path based on your project structure
import { useUser } from "@clerk/clerk-expo"; // Import useUser hook

const BASE_API_URL = "https://raccoon-honest-lively.ngrok-free.app";
const API_URL = `${BASE_API_URL}/api/ride`;

const Rides = () => {
  const { user, isLoaded } = useUser(); // Get user and loading state
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRides = async () => {
      if (!isLoaded) {
        console.log("User data is loading...");
        setLoading(true);
        return;
      }

      if (!user || !user.id) {
        console.log("No user logged in");
        Alert.alert("Error", "Please log in to view your rides");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching rides for clerk_id:", user.id); // Debug log
        const response = await axios.get(`${API_URL}/search`, {
          params: {
            clerk_id: user.id, // Filter rides by the current user's clerk_id
            origin: "", // Adjust params as needed
            destination: "", // Adjust params as needed
          },
        });
        console.log("Search params sent:", { clerk_id: user.id, origin: "", destination: "" }); // Debug log
        console.log("Fetched rides:", response.data); // Debug log
        setRides(response.data);
      } catch (error) {
        console.error("Error fetching rides:", error);
        Alert.alert("Error", "Failed to fetch rides. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [isLoaded, user]);

  const renderRideItem = ({ item }: { item: any }) => {
    const mappedRide = {
      id: item.id,
      origin_address: item.origin_address,
      destination_address: item.destination_address,
      departure_time: item.departure_time,
      price: item.price,
      car_model: item.car_model,
      available_seats: item.available_seats,
      driver_name: item.driver_name,
      origin_latitude: 12.8275.toString(), // Example latitude for Nandivaram
      origin_longitude: 80.0667.toString(), // Example longitude for Nandivaram
      destination_latitude: 9.1532.toString(), // Example latitude for Adoor
      destination_longitude: 76.7335.toString(), // Example longitude for Adoor
      ride_time: Math.floor(
        (new Date(Date.parse(item.departure_time)).getTime() - Date.now()) / 60000
      ),
      fare_price: item.price,
      driver: {
        driver_id: item.driver_id || "unknown_driver",
        first_name: item.driver_name?.split(" ")[0] || "Unknown",
        last_name: item.driver_name?.split(" ")[1] || "Driver",
        profile_image_url: item.driver_profile_image_url || "https://example.com/default-profile.png",
        car_image_url: item.driver_car_image_url || "https://example.com/default-car.png",
        car_seats: item.available_seats,
        rating: item.driver_rating?.toString() || "4.5",
      },
      created_at: item.departure_time,
      payment_status: "pending",
      ride_id: item.id,
      driver_id: item.driver_id || "unknown_driver",
      user_id: item.user_id || "unknown_user",
    };

    return <RideCard ride={mappedRide} />;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Loading your rides...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRideItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No rides available</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    margin: 20,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#263238",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#757575",
    marginTop: 20,
  },
});

export default Rides;