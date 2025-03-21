import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import React from "react";

export default function HostRide() {
  const params = useLocalSearchParams();
  const { fromAddress, toAddress } = params;
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    // TODO: API call to host the ride with fromAddress, toAddress, time, price
    console.log("Hosting ride:", { fromAddress, toAddress, time, price });
    router.back(); // Or navigate to a confirmation screen
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
      />
      <TextInput
        style={styles.input}
        placeholder="Price (e.g., ₹20)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Host Ride</Text>
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
});
