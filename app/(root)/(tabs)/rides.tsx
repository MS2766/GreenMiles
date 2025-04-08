/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Text, SafeAreaView, FlatList, View, StyleSheet } from "react-native";
import axios from "axios";
import RideCard from "@/components/RideCard"; // Adjust the import path based on your project structure

const BASE_API_URL = "https://raccoon-honest-lively.ngrok-free.app";
const API_URL = `${BASE_API_URL}/api/ride`;

const Rides = () => {
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get(`${API_URL}/search`, {
          params: { origin: "", destination: "" }, // Adjust params as needed
        });
        console.log("Fetched rides:", response.data); // Debug log
        setRides(response.data);
      } catch (error) {
        console.error("Error fetching rides:", error);
      }
    };
    fetchRides();
  }, []);

  const renderRideItem = ({ item }: { item: any }) => {
    // Map the API response to the RideCard expected structure
    const mappedRide = {
      id: item.id,
      origin_address: item.origin_address,
      destination_address: item.destination_address,
      departure_time: item.departure_time, // Use for ride_time if needed
      price: item.price, // Map to fare_price
      car_model: item.car_model, // Use if driver.car_model is needed
      available_seats: item.available_seats,
      driver_name: item.driver_name, // Split into first_name and last_name if needed
      // Placeholder for missing fields (add these to DB or calculate)
      origin_latitude: 12.8275.toString(), // Example latitude for Nandivaram (adjust dynamically if possible)
      origin_longitude: 80.0667.toString(), // Example longitude for Nandivaram
      destination_latitude: 9.1532.toString(), // Example latitude for Adoor
      destination_longitude: 76.7335.toString(), // Example longitude for Adoor
      ride_time: Math.floor(
        (new Date(Date.parse(item.departure_time)).getTime() - Date.now()) / 60000
      ), // Minutes until departure
      fare_price: item.price, // Assuming price is fare_price
      driver: {
        first_name: item.driver_name?.split(" ")[0] || "Unknown",
        last_name: item.driver_name?.split(" ")[1] || "Driver",
        rating: 4.5, // Placeholder, fetch from DB if available
        car_seats: item.available_seats,
      },
      created_at: item.departure_time, // Use departure_time as a proxy
      payment_status: "pending", // Placeholder, update based on your logic
      ride_id: item.id, // Map id to ride_id
      driver_id: item.driver_id || "unknown_driver", // Placeholder or map from API
      user_id: item.user_id || "unknown_user", // Placeholder or map from API
    };

    return <RideCard ride={mappedRide} />;
  };

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
