import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
} from "react-native";
import axios from "axios";
import React from "react";

// Haversine formula to calculate distance
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface GoogleTextInputProps {
  icon?: any;
  initialLocation?: string;
  containerStyle?: any;
  textInputBackgroundColor?: string;
  onPlaceSelected?: (data: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
  }) => void;
  userLocation?: { latitude: number; longitude: number };
}

const GoogleTextInput = ({
  icon,
  initialLocation = "",
  containerStyle,
  textInputBackgroundColor = "#F3F4F6",
  onPlaceSelected,
  userLocation,
}: GoogleTextInputProps) => {
  const [query, setQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
<<<<<<< HEAD

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
=======
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );

    // Cleanup listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch suggestions when query or userLocation changes
  useEffect(() => {
    if (!query || query.length < 2 || !userLocation) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestionsAndSort = async () => {
      try {
        const requestBody: any = {
          input: query,
          languageCode: "en",
          locationBias: {
            circle: {
              center: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              radius: 10000,
            },
          },
        };

        const response = await axios.post(
          "https://places.googleapis.com/v1/places:autocomplete",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": process.env.EXPO_PUBLIC_STATIC_MAPS_KEY || "",
            },
          },
        );

        const suggestionsData = response.data.suggestions || [];
        if (suggestionsData.length === 0) {
          setSuggestions([]);
          return;
        }

        const detailedSuggestions = await Promise.all(
          suggestionsData.slice(0, 5).map(async (suggestion: any) => {
            try {
              const detailsResponse = await axios.get(
                `https://places.googleapis.com/v1/places/${suggestion.placePrediction.placeId}`,
                {
                  headers: {
                    "X-Goog-Api-Key":
                      process.env.EXPO_PUBLIC_STATIC_MAPS_KEY || "",
                    "X-Goog-FieldMask":
                      "id,displayName,location,formattedAddress",
                  },
                },
              );
              const details = detailsResponse.data;
              const distance = details.location
                ? getDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    details.location.latitude,
                    details.location.longitude,
                  )
                : Infinity;
              return { ...suggestion, details, distance };
            } catch (error) {
              console.log(
                "Details Error for",
                suggestion.placePrediction.placeId,
                error,
              );
              return { ...suggestion, details: null, distance: Infinity };
            }
          }),
        );

        const sortedSuggestions = detailedSuggestions.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
        );
        setSuggestions(sortedSuggestions);
      } catch (error) {
<<<<<<< HEAD
        console.log(
          "Autocomplete Error:",
          axios.isAxiosError(error)
            ? error.response?.data || error.message
            : error,
        );
=======
        if (axios.isAxiosError(error)) {
          console.log(
            "Autocomplete Error:",
            error.response?.data || error.message,
          );
        } else {
          console.log("Autocomplete Error:", error);
        }
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestionsAndSort, 300);
    return () => clearTimeout(timeoutId);
  }, [query, userLocation]);

  const handleSelect = (suggestion: any) => {
    const placeData = {
      description: suggestion.placePrediction.text.text,
      placeId: suggestion.placePrediction.placeId,
      latitude: suggestion.details?.location?.latitude || 0,
      longitude: suggestion.details?.location?.longitude || 0,
    };
    onPlaceSelected?.(placeData);

    setQuery(suggestion.placePrediction.text.text);
    setSuggestions([]);
<<<<<<< HEAD
    Keyboard.dismiss();
=======
    Keyboard.dismiss(); // Dismiss keyboard after selection
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
      <TextInput
        placeholder="Search location"
        value={query}
        onChangeText={setQuery}
        style={[
          styles.textInput,
          {
            backgroundColor: textInputBackgroundColor,
            paddingLeft: icon ? 40 : 12,
          },
        ]}
      />
      {isKeyboardVisible && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.placePrediction.placeId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
            >
              <Image
<<<<<<< HEAD
                source={require("../assets/icons/pin.png")}
=======
                source={require("../assets/icons/pin.png")} // Replace with icons.pin if available
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7
                style={styles.suggestionIcon}
                resizeMode="contain"
              />
              <Text
                style={styles.suggestionText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.placePrediction.text.text}
                {item.details?.formattedAddress
                  ? `, ${item.details.formattedAddress}`
                  : ""}
                {typeof item.distance === "number" && item.distance !== Infinity
                  ? ` • ${item.distance.toFixed(1)} km`
                  : ""}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionList}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
    position: "relative",
  },
  icon: {
    width: 20,
    height: 20,
    opacity: 0.6,
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: "Jakarta-Regular",
    color: "#202124",
  },
  suggestionList: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: "#5f6368",
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Jakarta-Regular",
    color: "#202124",
  },
});

export default GoogleTextInput;
