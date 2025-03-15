import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import React from "react";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ marginVertical: 6, width: "100%" }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Jakarta-SemiBold",
              marginBottom: 8,
            }}
          >
            {label}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 6,
              paddingVertical: 8,
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 25,
              height: 45,
            }}
          >
            {icon && (
              <Image
                source={icon}
                style={{
                  width: 14,
                  height: 14,
                  marginHorizontal: 10,
                  opacity: 0.6,
                }}
                resizeMode="contain"
              />
            )}
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "Jakarta-Regular",
                padding: 0,
                paddingVertical: 4,
              }}
              secureTextEntry={secureTextEntry}
              placeholderTextColor="#9CA3AF"
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
