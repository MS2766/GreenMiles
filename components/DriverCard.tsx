import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MarkerData } from "@/types/type";
import React from "react";

interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: (id: number) => void;
}

export default function DriverCard({
  item,
  selected,
  setSelected,
}: DriverCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected === item.id && styles.selectedContainer,
      ]}
      onPress={() => setSelected(item.id)}
    >
      <View style={styles.driverInfo}>
        <Image
          source={{ uri: item.profile_image_url }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.details}>
            {`${item.car_seats} seats • ${item.time} mins • $${item.price}`}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedContainer: {
    backgroundColor: "#F0F9FF",
    borderColor: "#0EA5E9",
    borderWidth: 1,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Medium",
    color: "#1F2937",
  },
  details: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#6B7280",
    marginTop: 4,
  },
  ratingContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Medium",
    color: "#1F2937",
  },
});
