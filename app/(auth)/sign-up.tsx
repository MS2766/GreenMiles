import {
  Text,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import VerificationModal from "@/components/VerificationModal";
import { fetchAPI } from "@/lib/fetch";

type VerificationState = {
  state: "default" | "pending" | "failed" | "success";
  error: string;
  code: string;
};

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = React.useState<VerificationState>({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
        code: "",
      });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.longMessage || "Failed to initiate sign-up",
      );
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    const codeToVerify = verification.code.trim();

    if (codeToVerify.length !== 6) {
      setVerification({
        ...verification,
        state: "failed",
        error: "Please enter a 6-digit code",
      });
      return;
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: codeToVerify,
      });

      if (signUpAttempt.status === "complete") {
        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              clerkID: signUpAttempt.createdUserId,
            }),
          });
        } catch (fetchError) {
          // Log the error but don’t fail the flow, since Clerk verification succeeded
          console.error("fetchAPI failed but continuing:", fetchError);
        }

        await setActive({ session: signUpAttempt.createdSessionId });
        setVerification({ ...verification, state: "success", error: "" });
      } else {
        setVerification({
          ...verification,
          state: "failed",
          error: `Sign-up incomplete. Status: ${signUpAttempt.status}. Missing fields: ${signUpAttempt.missingFields?.join(", ") || "none"}`,
        });
      }
    } catch (err: any) {
      let errorMessage =
        "An error occurred during verification. Please try again.";
      if (err.errors) {
        const clerkError = err.errors[0];
        errorMessage =
          clerkError.longMessage || clerkError.message || errorMessage;
        switch (clerkError.code) {
          case "form_code_incorrect":
            errorMessage = "Invalid verification code. Please try again.";
            break;
          case "verification_expired":
            errorMessage =
              "Verification code has expired. Please request a new one.";
            break;
          case "form_identifier_not_found":
            errorMessage = "Email not recognized. Please sign up again.";
            break;
          default:
            errorMessage = `Verification failed: ${clerkError.message}`;
        }
      } else if (err.message?.includes("JSON Parse error")) {
        errorMessage = "Server returned invalid data. Please try again later.";
      } else if (
        err.code === "ECONNABORTED" ||
        err.message?.includes("Network Error")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else {
        errorMessage = `Unexpected error: ${err.message || "Unknown issue"}. Please try again.`;
      }

      setVerification({
        ...verification,
        state: "failed",
        error: errorMessage,
      });
    }
  };

  const onResendCode = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
        code: "",
        error: "",
      });
      Alert.alert("Success", "A new code has been sent to your email.");
    } catch (err: any) {
      Alert.alert("Error", "Failed to resend code.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/welcome")}
            className="absolute z-20 p-5"
          >
            <Text className="text-black text-md font-JakartaBold">
              ← Go back
            </Text>
          </TouchableOpacity>
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute z-10 w-full text-center bottom-5">
            Create your account
          </Text>
        </View>

        <View style={{ marginTop: -30 }} className="p-5">
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href={"/(auth)/sign-in"}
            className="text-large text-center mt-10 text-general-200"
          >
            <Text className="font-bold">Already have an account?</Text>
            <Text className="text-blue-500 font-bold"> Sign In</Text>
          </Link>
        </View>

        <ReactNativeModal isVisible={verification.state === "pending"}>
          <VerificationModal
            verification={verification}
            setVerification={setVerification}
            onVerifyPress={onVerifyPress}
            onResendCode={onResendCode}
          />
        </ReactNativeModal>

        {verification.state === "failed" && verification.error && (
          <Text className="text-red-500 text-center mt-5">
            {verification.error}
          </Text>
        )}

        <ReactNativeModal isVisible={verification.state === "success"}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-grey-400 font-Jakarta text-center mt-2">
              Your account has been created successfully
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(root)/(tabs)/home")}
              className="mt-5"
            >
              <Text className="text-center text-black text-lg font-JakartaBold">
                → Home
              </Text>
            </TouchableOpacity>
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
