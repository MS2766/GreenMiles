/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { Image } from "react-native";
import React from "react";

const { height } = Dimensions.get("window");
const MIN_HEIGHT = 100;
const MID_HEIGHT = 400;
const MAX_HEIGHT = height * 0.8;

interface RideLayoutProps {
  children: React.ReactNode;
  markers: { latitude: number; longitude: number; color: string }[];
  routeCoords?: { latitude: number; longitude: number }[];
  isLoading?: boolean;
  onBackPress?: () => void;
}

const RideLayout = ({
  children,
  markers,
  routeCoords = [],
  isLoading = false,
  onBackPress,
}: RideLayoutProps) => {
  const translateY = useSharedValue(height - MID_HEIGHT);
  const bottomSheetHeight = useSharedValue(MID_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => {
    bottomSheetHeight.value = height - translateY.value;
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startY: number }) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newY = ctx.startY + event.translationY;
      if (newY >= height - MAX_HEIGHT && newY <= height - MIN_HEIGHT) {
        translateY.value = newY;
      }
    },
    onEnd: () => {
      const currentY = translateY.value;
      if (currentY < height - MID_HEIGHT - 50) {
        translateY.value = withSpring(height - MAX_HEIGHT, { damping: 15 });
      } else if (currentY > height - MID_HEIGHT + 50) {
        translateY.value = withSpring(height - MIN_HEIGHT, { damping: 15 });
      } else {
        translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
      }
    },
  });

  // Animate bottom sheet to middle height on mount
  useEffect(() => {
    translateY.value = withSpring(height - MID_HEIGHT, { damping: 15 });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Map
              markers={markers}
              routeCoords={routeCoords}
              bottomSheetHeight={bottomSheetHeight}
            />
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.bottomSheet, animatedStyle]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetContent}>{children}</View>
              </Animated.View>
            </PanGestureHandler>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress || (() => router.back())}
            >
              <Image source={icons.backArrow} style={styles.backIcon} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    fontFamily: "Jakarta-Regular",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: MAX_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "#263238",
  },
});

export default RideLayout;
