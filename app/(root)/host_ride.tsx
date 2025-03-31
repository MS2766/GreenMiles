import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import React from "react";
import { useUser } from "@clerk/clerk-expo";

export default function HostRide() {
  const params = useLocalSearchParams();
  const { fromAddress, toAddress } = params;
  const { user } = useUser(); // Get authenticated user from Clerk
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fromAddress || !toAddress || !time || !price) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to host a ride");
      return;
    }

    const clerkID = user.id; // Clerk user ID

    setIsLoading(true);
    try {
      // API call to host the ride
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originAddress: fromAddress,
          destinationAddress: toAddress,
          departureTime: time,
          price,
          clerkID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to host ride");
      }

      Alert.alert("Success", "Ride hosted successfully!");
      router.back(); // Or navigate to a confirmation screen
    } catch (error) {
      console.error("Error hosting ride:", error);
      Alert.alert("Error", error.message || "Failed to host ride");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Host a Ride</Text>
      <Text style={styles.label}>From: {fromAddress || "Not set"}</Text>
      <Text style={styles.label}>To: {toAddress || "Not set"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Departure Time (e.g., 10:00 AM)"
        value={time}
        onChangeText={setTime}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (e.g., ₹20)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Hosting..." : "Host Ride"}
        </Text>
      </TouchableOpacity>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#263238",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
});
