import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { icons } from "@/constants";

const TabIcon = ({ focused, icon }) => (
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

const Layout = () => (
  <Tabs
    initialRouteName="home"
    screenOptions={{
      tabBarActiveTintColor: "white",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#1A1A1A",
      },
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

export default Layout;
