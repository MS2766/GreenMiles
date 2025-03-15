import { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { Image, View, Keyboard, StyleProp, ViewStyle } from "react-native";
import { icons } from "@/constants";
import React from "react";

const TabIcon = ({ focused, icon }: { focused: boolean; icon: any }) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <Image
      source={icon}
      style={{
        width: 24,
        height: 24,
        tintColor: focused ? "white" : "gray",
      }}
    />
  </View>
);

const Layout = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: [
          {
            backgroundColor: "#1A1A1A",
            display: isKeyboardVisible ? "none" : "flex", // Hide tab bar when keyboard is visible
          },
        ] as StyleProp<ViewStyle>, // Type assertion to fix StyleProp
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
<<<<<<< HEAD
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.map} />
          ),
        }}
      />
      <Tabs.Screen
=======
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.chat} />
          ),
        }}
      />
      <Tabs.Screen
<<<<<<< HEAD
=======
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.map} />
          ),
        }}
      />
      <Tabs.Screen
>>>>>>> 1cbad91f9a549c933c136930dc9d6da7243099b7
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.profile} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
