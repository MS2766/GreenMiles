import RideCard from "@/components/RideCard";
import Map from "@/components/Map";
import { useUser } from "@clerk/clerk-expo";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { icons } from "@/constants";
import * as Location from "expo-location";
import GoogleTextInput from "@/components/GoogleTextInput";
import { router } from "expo-router";
import React from "react";

const recentRides = [
  {
    ride_id: "1",
    origin_address: "Kathmandu, Nepal",
    destination_address: "Pokhara, Nepal",
    origin_latitude: "27.717245",
    origin_longitude: "85.323961",
    destination_latitude: "28.209583",
    destination_longitude: "83.985567",
    ride_time: 391,
    fare_price: "19500.00",
    payment_status: "Paid",
    driver_id: 2,
    user_id: "1",
    created_at: "2024-08-12 05:19:20.620007",
    driver: {
      driver_id: "2",
      first_name: "David",
      last_name: "Brown",
      profile_image_url:
        "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      car_seats: 5,
      rating: "4.60",
    },
  },
  {
    ride_id: "2",
    origin_address: "Jalkot, MH",
    destination_address: "Pune, Maharashtra, India",
    origin_latitude: "18.609116",
    origin_longitude: "77.165873",
    destination_latitude: "18.520430",
    destination_longitude: "73.856744",
    ride_time: 491,
    fare_price: "24500.00",
    payment_status: "Paid",
    driver_id: 1,
    user_id: "1",
    created_at: "2024-08-12 06:12:17.683046",
    driver: {
      driver_id: "1",
      first_name: "James",
      last_name: "Wilson",
      profile_image_url:
        "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: "4.80",
    },
  },
  {
    ride_id: "3",
    origin_address: "Zagreb, Croatia",
    destination_address: "Rijeka, Croatia",
    origin_latitude: "45.815011",
    origin_longitude: "15.981919",
    destination_latitude: "45.327063",
    destination_longitude: "14.442176",
    ride_time: 124,
    fare_price: "6200.00",
    payment_status: "Paid",
    driver_id: 1,
    user_id: "1",
    created_at: "2024-08-12 08:49:01.809053",
    driver: {
      driver_id: "1",
      first_name: "James",
      last_name: "Wilson",
      profile_image_url:
        "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: "4.80",
    },
  },
  {
    ride_id: "4",
    origin_address: "Okayama, Japan",
    destination_address: "Osaka, Japan",
    origin_latitude: "34.655531",
    origin_longitude: "133.919795",
    destination_latitude: "34.693725",
    destination_longitude: "135.502254",
    ride_time: 159,
    fare_price: "7900.00",
    payment_status: "Paid",
    driver_id: 3,
    user_id: "1",
    created_at: "2024-08-12 18:43:54.297838",
    driver: {
      driver_id: "3",
      first_name: "Michael",
      last_name: "Johnson",
      profile_image_url:
        "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
      car_image_url:
        "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
      car_seats: 4,
      rating: "4.70",
    },
  },
];

export default function Page() {
  const { user, isLoaded } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [locationAddress, setLocationAddress] = useState(
    "Fetching location...",
  );

  const colors = {
    primary: "#1E88E5",
    secondary: "#FFFFFF",
    accent: "#43A047",
    textPrimary: "#212121",
    textSecondary: "#757575",
    background: "#F5F5F5",
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationAddress("Enable location to find rides");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      (async () => {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (address.length > 0) {
          const { city, region, country } = address[0];
          setLocationAddress(`${city}, ${region}, ${country}`);
        } else {
          setLocationAddress("Location unavailable");
        }
      })();
    }
  }, [location]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRideAgain = (ride: (typeof recentRides)[0]) => {
    router.push({
      pathname: "/(root)/find_or_host",
      params: {
        fromAddress: ride.origin_address,
        fromLatitude: ride.origin_latitude,
        fromLongitude: ride.origin_longitude,
        toAddress: ride.destination_address,
        toLatitude: ride.destination_latitude,
        toLongitude: ride.destination_longitude,
      },
    });
  };

  const renderHeader = () => (
    <View className="p-5 bg-white rounded-b-3xl">
      {/* Gradient Header */}
      <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-2xl -mx-5 -mt-5">
        <Text className="text-2xl text-center font-JakartaBold text-grey-800">
          Hello, {isLoaded ? user?.firstName || "Rider" : "Loading..."}
        </Text>
        <Text className="text-sm text-center text-gray-800 mt-1">
          Where are you going today?
        </Text>
      </View>

      {/* Search Input */}
      <GoogleTextInput
        icon={icons.search}
        containerStyle={{
          marginTop: 16,
          backgroundColor: "#F3F4F6",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
        userLocation={
          location
            ? { latitude: location.latitude, longitude: location.longitude }
            : undefined
        }
        onPlaceSelected={(placeData) => {
          if (location && placeData.latitude && placeData.longitude) {
            router.push({
              pathname: "/(root)/find_or_host",
              params: {
                fromAddress: locationAddress,
                fromLatitude: location.latitude.toString(),
                fromLongitude: location.longitude.toString(),
                toAddress: placeData.description,
                toLatitude: placeData.latitude.toString(),
                toLongitude: placeData.longitude.toString(),
              },
            });
          }
        }}
      />

      {/* Location Card */}
      <View className="absolute top-40 mt-5 left-3 right-2 bg-transparent rounded-lg p-2">
        <View className="flex-row">
          <Image source={icons.point} className="w-5 h-5 mr-2 tint-white" />
          <Text
            className="text-sm font-JakartaSemiBold text-black flex-1"
            numberOfLines={1}
          >
            {locationAddress}
          </Text>
        </View>
      </View>
      <View className="mt-8 bg-gray-50 rounded-xl">
        <View className="h-48 rounded-lg overflow-hidden">
          {location ? (
            <View className="flex-1 h-48 rounded-xl">
              <Map
                markers={[
                  {
                    latitude: parseFloat(location.latitude.toString()),
                    longitude: parseFloat(location.longitude.toString()),
                  },
                ]}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-100 rounded-lg">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm text-gray-500 mt-2">
                {locationAddress}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Rides Header */}
      <Text className="text-lg text-center font-JakartaSemiBold text-gray-800 mt-6 mb-2">
        Recent Rides
      </Text>
    </View>
  );

  const renderRideItem = ({ item }: { item: (typeof recentRides)[0] }) => (
    <View className="mx-5 mb-4 bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => console.log(`Navigate to ride ${item.ride_id}`)}
      >
        <RideCard ride={item} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleRideAgain(item)}
        className="bg-gray-800 py-3 rounded-lg w-full"
      >
        <Text className="text-white font-JakartaSemiBold text-center">
          Ride Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.ride_id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="always"
      />
    </SafeAreaView>
  );
}
