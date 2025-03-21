import { Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import InputField from "@/components/InputField";
import React from "react";
import * as ImagePicker from "expo-image-picker";

const Profile = () => {
  const { signOut, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [form, setForm] = React.useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [imageKey, setImageKey] = React.useState(0);
  const [previousImageUrl, setPreviousImageUrl] = React.useState(
    user?.imageUrl || user?.externalAccounts[0]?.imageUrl || "",
  );

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const updateNeonDatabase = async (
    name: string,
    email: string,
    clerkId: string,
  ) => {
    try {
      const response = await fetch("/(api)/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          clerkID: clerkId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update Neon database: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Neon database update error:", error);
      throw error;
    }
  };

  const deleteFromNeonDatabase = async (clerkId: string) => {
    try {
      const response = await fetch("/(api)/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkID: clerkId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete from Neon database: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Neon database deletion error:", error);
      throw error;
    }
  };

  const onUpdatePress = async () => {
    if (!isLoaded || !user || !isSignedIn) {
      Alert.alert("Error", "You are not signed in. Please sign in again.");
      router.push("/(auth)/sign-in");
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      await user.update({
        firstName: form.firstName,
        lastName: form.lastName,
      });

      await updateNeonDatabase(
        fullName,
        user.primaryEmailAddress?.emailAddress || "",
        user.id,
      );

      await user.reload();
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      console.error("Update error:", err);
      let errorMessage = "Failed to update profile";
      if (err.errors && err.errors[0]) {
        errorMessage =
          err.errors[0].longMessage || err.errors[0].message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const onDeleteAccount = async () => {
    if (!isLoaded || !user || !isSignedIn) {
      Alert.alert("Error", "You are not signed in. Please sign in again.");
      router.push("/(auth)/sign-in");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFromNeonDatabase(user.id);
              await user.delete();
              await signOut();
              router.replace("/(auth)/welcome");
              Alert.alert("Success", "Account deleted successfully");
            } catch (err: any) {
              console.error("Delete error:", err);
              let errorMessage = "Failed to delete account";
              if (err.errors && err.errors[0]) {
                errorMessage =
                  err.errors[0].longMessage ||
                  err.errors[0].message ||
                  errorMessage;
              } else if (err.message) {
                errorMessage = err.message;
              }
              Alert.alert("Error", errorMessage);
            }
          },
        },
      ],
    );
  };

  const pickImage = async (retryCount = 0, maxRetries = 2) => {
    if (!isLoaded || !user || !isSignedIn) {
      Alert.alert("Error", "You are not signed in. Please sign in again.");
      router.push("/(auth)/sign-in");
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to enable permission to access your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);

        const fetchResponse = await fetch(imageUri);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch image: ${fetchResponse.statusText}`);
        }
        const imageBlob = await fetchResponse.blob();
        console.log("Image Blob size:", imageBlob.size);

        const currentImageUrl =
          user.imageUrl || user.externalAccounts[0]?.imageUrl || "";
        console.log("Current image URL before upload:", currentImageUrl);

        try {
          await user.setProfileImage({ file: imageBlob });
          console.log("Upload completed successfully");
        } catch (uploadError: any) {
          console.error("Upload error:", uploadError);
          if (
            uploadError.message?.includes("Network request failed") &&
            retryCount < maxRetries
          ) {
            console.log(`Retrying upload (${retryCount + 1}/${maxRetries})...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return pickImage(retryCount + 1, maxRetries);
          }
          throw uploadError;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await user.reload();
        console.log("Reloaded user, new image URL:", user.imageUrl);

        if (!user.imageUrl || user.imageUrl === currentImageUrl) {
          throw new Error("Profile image URL did not update after upload");
        }

        setImageKey((prev) => prev + 1);
        setPreviousImageUrl(user.imageUrl);
        Alert.alert("Success", "Profile picture updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      let errorMessage = "Failed to update profile picture";
      if (error.message?.includes("signed_out")) {
        errorMessage = "Session expired. Please sign in again.";
        router.push("/(auth)/sign-in");
      } else if (error.message?.includes("Network request failed")) {
        errorMessage = `Network error: Please check your connection and try again. ${retryCount >= maxRetries ? "(Retries exhausted)" : ""}`;
      } else if (error.message?.includes("Profile image URL did not update")) {
        errorMessage = "Image upload failed to update profile. Try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 px-6 py-4">
        {/* Header */}
        <Text className="text-3xl font-JakartaBold text-gray-900 mt-8 mb-4 text-center">
          Your Profile
        </Text>

        {/* Profile Image */}
        <View className="flex items-center mb-6">
          <TouchableOpacity
            onPress={() => pickImage()}
            className="relative shadow-md"
          >
            <Image
              source={{
                uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
              }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
              className="border-4 border-white bg-gray-200"
              key={imageKey}
            />
            <View className="absolute bottom-0 right-2 bg-gray-800 rounded-full p-1.5 shadow-sm">
              <Text className="text-white text-sm font-JakartaMedium">
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          <Text className="text-lg font-JakartaSemiBold text-gray-700 mt-3">
            {user?.firstName} {user?.lastName}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="w-full max-w-[340px] mx-auto bg-white rounded-xl p-5 shadow-md">
          <InputField
            label="First Name"
            placeholder={user?.firstName || "Not Found"}
            containerStyle="w-full mb-4"
            inputStyle="p-3 text-gray-800 text-base border border-gray-300 rounded-lg"
            labelStyle="text-gray-600 font-JakartaMedium"
            value={form.firstName}
            onChangeText={(value) => setForm({ ...form, firstName: value })}
            editable={true}
            onSubmitEditing={onUpdatePress}
          />
          <InputField
            label="Last Name"
            placeholder={user?.lastName || "Not Found"}
            containerStyle="w-full mb-4"
            inputStyle="p-3 text-gray-800 text-base border border-gray-300 rounded-lg"
            labelStyle="text-gray-600 font-JakartaMedium"
            value={form.lastName}
            onChangeText={(value) => setForm({ ...form, lastName: value })}
            editable={true}
            onSubmitEditing={onUpdatePress}
          />
          <InputField
            label="Email"
            placeholder={user?.primaryEmailAddress?.emailAddress || "Not Found"}
            containerStyle="w-full mb-4"
            inputStyle="p-3 text-gray-600 text-base border border-gray-300 rounded-lg bg-gray-50"
            labelStyle="text-gray-600 font-JakartaMedium"
            editable={false}
          />
          <InputField
            label="Verification Status"
            containerStyle="w-full"
            inputStyle={`p-3 text-base border border-gray-300 rounded-lg ${
              user?.primaryEmailAddress?.verification.status === "verified"
                ? "text-green-600 bg-green-50"
                : "text-orange-600 bg-orange-50"
            }`}
            labelStyle="text-gray-600 font-JakartaMedium"
            editable={false}
            value={
              user?.primaryEmailAddress?.verification.status === "verified"
                ? "Account Verified"
                : "Verification Pending"
            }
          />
        </View>

        {/* Buttons */}
        <View className="flex-row justify-center gap-4 mt-8 px-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-gray-800 py-3 px-12 rounded-[6] shadow-md"
          >
            <Text className="text-white text-center font-JakartaBold text-base">
              Log Out
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDeleteAccount}
            className="bg-red-600 py-3 px-4 rounded-[6] shadow-md"
          >
            <Text className="text-white text-center font-JakartaBold text-base">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
