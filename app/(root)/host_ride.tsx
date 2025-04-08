/* eslint-disable prettier/prettier */
// app/(root)/host_ride.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useLocalSearchParams, router } from "expo-router";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import Map, { MarkerData } from "@/components/Map";
import axios from "axios";
import { fetchAPI } from "@/lib/fetch";

// Define interfaces
interface RideData {
  originAddress: string;
  destinationAddress: string;
  departureTime: string;
  price: number;
  car: string;
  seats: number;
  phone: string;
  clerkID: string;
}

// API URL with fallback
const BASE_API_URL = "https://raccoon-honest-lively.ngrok-free.app"; // Update this
const API_URL = `${BASE_API_URL}/api/ride`;

export default function HostRide() {
  const params = useLocalSearchParams();
  const {
    fromAddress,
    fromLatitude,
    fromLongitude,
    toAddress,
    toLatitude,
    toLongitude,
  } = params;
  const { user } = useUser();

  // State
  const [departureTime, setDepartureTime] = useState<Date>(new Date());
  const [price, setPrice] = useState<string>("");
  const [car, setCar] = useState<string>("");
  const [seats, setSeats] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

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

  // Set initial markers and fetch route
  useEffect(() => {
    const fromLat = fromLatitude ? parseFloat(fromLatitude as string) : null;
    const fromLng = fromLongitude ? parseFloat(fromLongitude as string) : null;
    const toLat = toLatitude ? parseFloat(toLatitude as string) : null;
    const toLng = toLongitude ? parseFloat(toLongitude as string) : null;

    const newMarkers: MarkerData[] = [];
    if (fromLat && fromLng) {
      newMarkers.push({
        latitude: fromLat,
        longitude: fromLng,
        color: "blue",
      });
    }
    if (toLat && toLng) {
      newMarkers.push({ latitude: toLat, longitude: toLng, color: "red" });
    }
    setMarkers(newMarkers);

    if (fromLat && fromLng && toLat && toLng) {
      fetchRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng });
    }
  }, [fromLatitude, fromLongitude, toLatitude, toLongitude]);

  // Date picker handlers
  const showAndroidDatePicker = () => {
    try {
      DateTimePickerAndroid.open({
        value: departureTime,
        mode: "date",
        is24Hour: true,
        display: "default",
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === "set" && selectedDate) {
            const currentDate = selectedDate;
            showAndroidTimePicker(currentDate);
          }
        },
      });
    } catch (error) {
      console.error("Error opening date picker:", error);
      Alert.alert("Error", "Could not open date picker");
    }
  };

  const showAndroidTimePicker = (currentDate: Date) => {
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "time",
      is24Hour: true,
      display: "default",
      onChange: (timeEvent: DateTimePickerEvent, selectedTime?: Date) => {
        if (timeEvent.type === "set" && selectedTime) {
          const finalDateTime = new Date(currentDate);
          finalDateTime.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
          );
          setDepartureTime(finalDateTime);
          setErrors((prev) => ({ ...prev, departureTime: "" }));
        }
      },
    });
  };

  const handleIOSDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDepartureTime(selectedDate);
      setErrors((prev) => ({ ...prev, departureTime: "" }));
    }
    if (Platform.OS === "ios") {
      setShowPicker(false);
    }
  };

  // Validation
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fromAddress || !toAddress) {
      newErrors.address = "Origin and destination addresses are required";
    }
    if (!car.trim()) {
      newErrors.car = "Car model is required";
    }
    if (!seats.trim() || isNaN(Number(seats)) || Number(seats) <= 0) {
      newErrors.seats = "Seats must be a positive number";
    }
    if (!phone.trim() || !/^\d{10,15}$/.test(phone)) {
      newErrors.phone = "Phone number must be 10-15 digits";
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (departureTime <= new Date()) {
      newErrors.departureTime = "Departure time must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to host a ride");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    const rideData: RideData = {
      originAddress: fromAddress as string,
      destinationAddress: toAddress as string,
      departureTime: departureTime.toISOString(),
      price: Number(price),
      car,
      seats: Number(seats),
      phone,
      clerkID: user.id,
    };

    setIsLoading(true);
    try {
      console.log("Submitting to:", API_URL);
      console.log("Request data:", rideData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response:", result);

      Alert.alert("Success", "Ride hosted successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/(root)/(tabs)/rides",
              params: { refresh: "true" },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error hosting ride:", error);
      handleSubmitError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitError = (error: any) => {
    if (error.name === "AbortError") {
      Alert.alert("Timeout", "Request took too long. Please try again.");
    } else if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      Alert.alert(
        "Network Error",
        "Unable to connect to the server. Please check your internet connection or server status.",
      );
    } else {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Host a Ride</Text>

        {/* Section: Route Details with Map */}
        <View style={styles.section}>
          <View style={styles.mapContainer}>
            <Map
              markers={markers}
              routeCoords={routeCoords}
              bottomSheetHeight={undefined}
            />
          </View>
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>

        {/* Section: Ride Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Details</Text>

          {/* Departure Time */}
          <TouchableOpacity
            style={[
              styles.input,
              errors.departureTime && styles.inputError,
              isLoading && styles.inputDisabled,
            ]}
            onPress={
              Platform.OS === "android"
                ? showAndroidDatePicker
                : () => setShowPicker(true)
            }
            disabled={isLoading}
          >
            <Text style={styles.inputText}>
              {departureTime.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {Platform.OS === "ios" && showPicker && (
            <DateTimePicker
              value={departureTime}
              mode="datetime"
              display="default"
              onChange={handleIOSDateChange}
            />
          )}
          {errors.departureTime && (
            <Text style={styles.errorText}>{errors.departureTime}</Text>
          )}

          {/* Car Model */}
          <TextInput
            style={[
              styles.input,
              errors.car && styles.inputError,
              isLoading && styles.inputDisabled,
            ]}
            placeholder="Car Model (e.g., Skoda Rapid)"
            value={car}
            onChangeText={setCar}
            autoCapitalize="words"
            editable={!isLoading}
            placeholderTextColor="#999"
          />
          {errors.car && <Text style={styles.errorText}>{errors.car}</Text>}

          {/* Seats Available */}
          <TextInput
            style={[
              styles.input,
              errors.seats && styles.inputError,
              isLoading && styles.inputDisabled,
            ]}
            placeholder="Seats Available (e.g., 4)"
            value={seats}
            onChangeText={setSeats}
            keyboardType="numeric"
            maxLength={2}
            editable={!isLoading}
            placeholderTextColor="#999"
          />
          {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}

          {/* Phone Number */}
          <TextInput
            style={[
              styles.input,
              errors.phone && styles.inputError,
              isLoading && styles.inputDisabled,
            ]}
            placeholder="Phone Number (e.g., 9876543210)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={15}
            editable={!isLoading}
            placeholderTextColor="#999"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Price */}
          <TextInput
            style={[
              styles.input,
              errors.price && styles.inputError,
              isLoading && styles.inputDisabled,
            ]}
            placeholder="Price (e.g., ₹20)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            maxLength={5}
            editable={!isLoading}
            placeholderTextColor="#999"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Hosting..." : "Host Ride"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Regular",
    backgroundColor: "#fff",
    color: "#263238",
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#ef5350",
  },
  inputDisabled: {
    backgroundColor: "#eceff1",
    opacity: 0.7,
  },
  inputText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#263238",
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
  errorText: {
    color: "#ef5350",
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Regular",
    marginBottom: 12,
    marginTop: -8,
  },
});
