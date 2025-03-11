import { Image, Text, View, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { useState } from "react";

const RideCard = ({ ride }: { ride: Ride }) => {
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [isMapLoaded, setMapLoaded] = useState(false);

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${ride.destination_latitude},${ride.destination_longitude}&zoom=14&size=600x400&key=${process.env.EXPO_PUBLIC_STATIC_MAPS_KEY}`;
  const zoomedMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x600&zoom=16&markers=color:green|label:S|${ride.origin_latitude},${ride.origin_longitude}&markers=color:red|label:D|${ride.destination_latitude},${ride.destination_longitude}&path=color:blue|weight:5|${ride.origin_latitude},${ride.origin_longitude}|${ride.destination_latitude},${ride.destination_longitude}&key=${process.env.EXPO_PUBLIC_STATIC_MAPS_KEY}`;

  const handleMapPress = () => {
    setMapLoaded(false);
    setMapModalVisible(true);
  };

  return (
    <View className="bg-white rounded-xl mx-4 shadow-md shadow-neutral-300 overflow-hidden">
      {/* Map and Address Section */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity activeOpacity={0.7} onPress={handleMapPress}>
          <Image
            source={{ uri: mapUrl, cache: "force-cache" }}
            style={{ width: 90, height: 100, borderRadius: 8 }}
          />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <View className="flex-row items-center mb-2">
            <Image source={icons.to} className="w-4 h-4 mr-2" />
            <Text
              className="text-sm font-JakartaMedium text-gray-600"
              numberOfLines={1}
            >
              {String(ride.origin_address || "Unknown Origin")}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Image source={icons.point} className="w-4 h-4 mr-2" />
            <Text
              className="text-sm font-JakartaMedium text-gray-600"
              numberOfLines={1}
            >
              {String(ride.destination_address || "Unknown Destination")}
            </Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View className="p-4 bg-gray-50 border-t border-gray-200">
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm font-JakartaMedium text-gray-500">
            Date & Time
          </Text>
          <Text className="text-sm font-JakartaBold text-gray-800">
            {String(formatDate(ride.created_at) || "Unknown Date")},{" "}
            {String(formatTime(ride.ride_time) || "Unknown Time")}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm font-JakartaMedium text-gray-500">
            Driver
          </Text>
          <Text className="text-sm font-JakartaBold text-gray-800">
            {String(ride.driver.first_name || "Unknown")}{" "}
            {String(ride.driver.last_name || "Driver")}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm font-JakartaMedium text-gray-500">
            Car Seats
          </Text>
          <Text className="text-sm font-JakartaBold text-gray-800">
            {String(ride.driver.car_seats ?? "N/A")}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm font-JakartaMedium text-gray-500">
            Payment Status
          </Text>
          <Text
            className={`text-sm font-JakartaBold capitalize ${
              ride.payment_status === "paid" ? "text-green-600" : "text-red-600"
            }`}
          >
            {String(ride.payment_status || "Unknown")}
          </Text>
        </View>
      </View>

      {/* Zoomed Map Modal */}
      <Modal
        isVisible={isMapModalVisible}
        onBackdropPress={() => setMapModalVisible(false)}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="bg-white rounded-lg p-4 w-[90%]">
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: zoomedMapUrl }}
              style={{ width: 300, height: 300, borderRadius: 8 }} // Square dimensions
              resizeMode="contain" // Show full image
              onLoad={() => setMapLoaded(true)}
            />
            {!isMapLoaded && (
              <View
                style={{
                  position: "absolute",
                  width: 300, // Match image width
                  height: 300, // Match image height
                  borderRadius: 8,
                  backgroundColor: "#e0e0e0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text className="text-md font-JakartaMedium text-gray-600">
                  Loading Map...
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="mt-4 bg-gray-200 rounded-full py-2 items-center"
            onPress={() => setMapModalVisible(false)}
          >
            <Text className="text-md font-JakartaMedium text-gray-800">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default RideCard;
