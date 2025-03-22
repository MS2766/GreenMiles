/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, Image, Alert } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "@/constants";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { router } from "expo-router";

const OAuth = () => {
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleGoogleSignIn = async () => {
    setIsLoading(true); // Show loading state
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "rideshare",
        path: "/(root)/(tabs)/home", // Redirect directly to home
      });

      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl,
        });

      if (createdSessionId) {
        // If a session was created, set it as active and navigate
        await setActive!({ session: createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else if (signUp) {
        // Handle sign-up case
        if (signUp.status === "missing_requirements") {
          const firstName = signUp.firstName || "";
          const lastName = signUp.lastName || "";
          const email = signUp.emailAddress || "";

          try {
            const response = await fetch("/(api)/user+api", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: `${firstName} ${lastName}`,
                email,
                clerkID: signUp.id,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create user");
            }

            // After successful user creation, navigate to home
            router.replace("/(root)/(tabs)/home");
          } catch (error) {
            Alert.alert(
              "Error",
              "Failed to complete sign up. Please try again.",
            );
          }
        }
      } else if (signIn) {
        // Handle sign-in case
        if (signIn.status === "complete") {
          router.replace("/(root)/(tabs)/home");
        } else {
          Alert.alert("Error", "Failed to sign in. Please try again.");
        }
      }
    } catch (err) {
      console.error("OAuth error", err);
      Alert.alert(
        "Authentication Error",
        "Failed to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 10,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
        <Text
          style={{
            marginHorizontal: 12,
            color: "#6B7280",
            fontSize: 16,
            fontFamily: "JakartaMedium",
          }}
        >
          or
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
      </View>

      <CustomButton
        title="Continue with Google"
        className="mt-5"
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
        isLoading={isLoading}
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            style={{
              width: 16,
              height: 16,
              marginHorizontal: 8,
            }}
          />
        )}
      />
    </View>
  );
};

export default OAuth;
