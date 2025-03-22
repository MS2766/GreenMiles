import { Image, Text, View, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import { useState } from "react";
import React from "react";

const RideCard = ({ ride }: { ride: Ride }) => {
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [isMapLoaded, setMapLoaded] = useState(false);

  const colors = {
    primary: "#1E88E5",
    accent: "#43A047",
    textPrimary: "#212121",
    textSecondary: "#757575",
    background: "#FFFFFF",
    border: "#E0E0E0",
  };

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${ride.destination_latitude},${ride.destination_longitude}&zoom=14&size=600x400&key=${process.env.EXPO_PUBLIC_STATIC_MAPS_KEY}`;
  const zoomedMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x600&zoom=16&markers=color:${colors.accent}|label:S|${ride.origin_latitude},${ride.origin_longitude}&markers=color:red|label:D|${ride.destination_latitude},${ride.destination_longitude}&path=color:${colors.primary}|weight:5|${ride.origin_latitude},${ride.origin_longitude}|${ride.destination_latitude},${ride.destination_longitude}&key=${process.env.EXPO_PUBLIC_STATIC_MAPS_KEY}`;

  const handleMapPress = () => {
    setMapLoaded(false);
    setMapModalVisible(true);
  };

  return (
    <View className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Map and Address Section */}
      <View className="flex-row items-start p-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleMapPress}
          className="rounded-lg overflow-hidden"
        >
          <Image
            source={{ uri: mapUrl, cache: "force-cache" }}
            style={{ width: 100, height: 100 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center mb-2">
            <Image source={icons.to} className="w-4 h-4 mr-2 tint-blue-500" />
            <Text
              className="text-sm font-JakartaSemiBold text-gray-800 flex-1"
              numberOfLines={1}
            >
              {ride.origin_address || "Unknown Origin"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Image source={icons.point} className="w-4 h-4 mr-2 tint-red-500" />
            <Text
              className="text-sm font-JakartaSemiBold text-gray-800 flex-1"
              numberOfLines={1}
            >
              {ride.destination_address || "Unknown Destination"}
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Image
              source={icons.clock}
              className="w-4 h-4 mr-2 tint-gray-500"
            />
            <Text className="text-xs text-gray-600">
              {formatTime(ride.ride_time) || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View className="p-3 bg-gray-50 border-t border-gray-100">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Image
              source={icons.calendar}
              className="w-4 h-4 mr-2 tint-gray-500"
            />
            <Text className="text-xs text-gray-600">
              {formatDate(ride.created_at) || "N/A"}
            </Text>
          </View>
          <Text className="text-sm font-JakartaBold text-gray-800">
            ${(parseFloat(ride.fare_price) / 100).toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Image
              source={icons.person}
              className="w-4 h-4 mr-2 tint-gray-500"
            />
            <Text className="text-xs text-gray-600">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Image
              source={icons.star}
              className="w-4 h-4 mr-1 tint-yellow-400"
            />
            <Text className="text-xs text-gray-600">
              {ride.driver.rating || "N/A"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Image source={icons.seat} className="w-4 h-4 mr-2 tint-gray-500" />
            <Text className="text-xs text-gray-600">
              {ride.driver.car_seats} seats
            </Text>
          </View>
          <Text
            className={`text-xs font-JakartaSemiBold px-2 py-1 rounded-full ${
              ride.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {ride.payment_status || "Unknown"}
          </Text>
        </View>
      </View>

      {/* Zoomed Map Modal */}
      <Modal
        isVisible={isMapModalVisible}
        onBackdropPress={() => setMapModalVisible(false)}
        style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View className="bg-white rounded-2xl p-4 w-[90%] max-w-[400px]">
          <View className="relative rounded-lg overflow-hidden">
            <Image
              source={{ uri: zoomedMapUrl }}
              style={{ width: "100%", height: 350, borderRadius: 8 }}
              resizeMode="cover"
              onLoad={() => setMapLoaded(true)}
            />
            {!isMapLoaded && (
              <View className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-lg">
                <Text className="text-sm font-JakartaMedium text-gray-600">
                  Loading Route...
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="mt-4 bg-blue-500 rounded-full py-2.5 px-6 self-center"
            onPress={() => setMapModalVisible(false)}
          >
            <Text className="text-white font-JakartaSemiBold">Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default RideCard;
