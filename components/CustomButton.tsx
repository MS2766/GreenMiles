import { Text, TouchableOpacity } from "react-native";
import { ButtonProps } from "@/types/type";
import React from "react";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "outline":
      return "bg-transparent border-[1px] border-neutral-300";
    case "secondary":
      return "bg-grey-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-gray-800";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-grey-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-white";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      paddingVertical: 12,
      ...(bgVariant === "outline" && {
        borderWidth: 1,
        borderColor: "#D1D5DB",
      }),
    }}
    className={`w-full rounded-[6] flex flex-row items-center justify-center ${getBgVariantStyle(bgVariant)} ${className}`}
    {...props}
  >
    {IconLeft && <IconLeft />}
    <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
      {title}
    </Text>
    {IconRight && <IconRight />}
  </TouchableOpacity>
);

export default CustomButton;
