import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import React from "react";

export default function FindRide() {
  const params = useLocalSearchParams();
  const { fromAddress, toAddress } = params;
  const [rides] = useState([]); // Placeholder for fetched rides

  const handleSearch = () => {
    // TODO: API call to fetch available rides based on fromAddress and toAddress
    console.log("Searching rides from:", fromAddress, "to:", toAddress);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carpool a Ride</Text>
      <Text style={styles.label}>From: {fromAddress || "Not set"}</Text>
      <Text style={styles.label}>To: {toAddress || "Not set"}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search Rides</Text>
      </TouchableOpacity>
      {rides.length === 0 ? (
        <Text style={styles.noRides}>No rides available yet.</Text>
      ) : (
        // TODO: Map over rides and display them (e.g., using RideCard)
        <Text style={styles.label}>Rides will be listed here.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#555",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#292929",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
  noRides: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
