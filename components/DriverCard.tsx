import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { MarkerData } from "@/types/type";

interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
}

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  return (
    <TouchableOpacity
      onPress={setSelected}
      className={`flex-row items-center justify-between py-4 px-3 rounded-xl mb-3 shadow-sm ${
        selected === item.id ? "bg-blue-100 border border-blue-500" : "bg-white"
      }`}
    >
      <Image
        source={{ uri: item.profile_image_url }}
        className="w-14 h-14 rounded-full"
      />

      <View className="flex-1 mx-3">
        <View className="flex-row items-center justify-start mb-1">
          <Text className="text-lg font-JakartaSemiBold text-gray-800">
            {item.title}
          </Text>
          <View className="flex-row items-center space-x-1 ml-2">
            <Image
              source={icons.star}
              className="w-3.5 h-3.5 tint-yellow-400"
            />
            <Text className="text-sm font-JakartaRegular text-gray-600">
              {item.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-start">
          {item.price && (
            <>
              <View className="flex-row items-center">
                <Image
                  source={icons.dollar}
                  className="w-4 h-4 tint-green-600"
                />
                <Text className="text-sm font-JakartaMedium text-gray-700 ml-1">
                  ${item.price}
                </Text>
              </View>
              <Text className="text-sm font-JakartaRegular text-gray-500 mx-2">
                |
              </Text>
            </>
          )}
          {item.time && (
            <>
              <Text className="text-sm font-JakartaMedium text-gray-700">
                {formatTime(item.time)}
              </Text>
              <Text className="text-sm font-JakartaRegular text-gray-500 mx-2">
                |
              </Text>
            </>
          )}
          <Text className="text-sm font-JakartaMedium text-gray-700">
            {item.car_seats} seats
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: item.car_image_url }}
        className="h-14 w-14"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default DriverCard;
