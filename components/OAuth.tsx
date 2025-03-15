import { View, Text, Image } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "@/constants";
import React from "react";

const OAuth = () => {
  const handleGoogleSignIn = async () => {};
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
