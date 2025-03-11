import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth radius in kilometers
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
  onPlaceSelected?: (data: any, details: any) => void;
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
  const [isFocused, setIsFocused] = useState(false);

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
              "X-Goog-Api-Key": process.env.EXPO_PUBLIC_STATIC_MAPS_KEY,
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
                    "X-Goog-Api-Key": process.env.EXPO_PUBLIC_STATIC_MAPS_KEY,
                    "X-Goog-FieldMask": "id,displayName,location",
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
        console.log("Autocomplete Error:", error.response?.data || error);
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
    };
    const details = suggestion.details || null;
    console.log("Selected Place:", { placeData, details });
    onPlaceSelected?.(placeData, details);

    setQuery(suggestion.placePrediction.text.text);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
      <TextInput
        placeholder="Search location"
        value={query}
        onChangeText={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        style={[
          styles.textInput,
          {
            backgroundColor: textInputBackgroundColor,
            paddingLeft: icon ? 30 : 10,
          },
        ]}
      />
      {isFocused && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.placePrediction.placeId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
            >
              <Text>
                {item.placePrediction.text.text}{" "}
                {typeof item.distance === "number" && item.distance !== Infinity
                  ? `(${item.distance.toFixed(2)} km)`
                  : ""}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionList}
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
    paddingVertical: 10,
    marginVertical: 6,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
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
  },
  suggestionList: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    zIndex: 9999,
    elevation: 3,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "#c8c7cc",
  },
});

export default GoogleTextInput;
