import { router } from "expo-router";
import React, { useRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface VerificationState {
  state: "pending" | "failed" | "success";
  error: string;
  code: string;
}

interface VerificationModalProps {
  verification: VerificationState;
  setVerification: (verification: VerificationState) => void;
  onVerifyPress: () => void;
  onResendCode: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  verification,
  setVerification,
  onVerifyPress,
  onResendCode,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

  const handleInputChange = (digit: string, index: number) => {
    if (!/^\d*$/.test(digit)) return; // Only allow digits
    const updatedCode = verification.code.padEnd(6, " ").split("");
    updatedCode[index] = digit;
    const newCode = updatedCode.join("").trim();
    setVerification({ ...verification, code: newCode });
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace") {
      const updatedCode = verification.code.split("");
      if (!updatedCode[index] && index > 0) {
        updatedCode[index - 1] = "";
        setVerification({ ...verification, code: updatedCode.join("") });
        inputRefs.current[index - 1]?.focus();
      } else if (updatedCode[index]) {
        updatedCode[index] = "";
        setVerification({ ...verification, code: updatedCode.join("") });
      }
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Please check your email for the verification code
      </Text>

      <View style={styles.inputContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            style={styles.inputBox}
            keyboardType="numeric"
            maxLength={1}
            value={verification.code[index] || ""}
            onChangeText={(digit) => handleInputChange(digit, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onVerifyPress}
        style={[styles.verifyButton, { backgroundColor: "black" }]}
      >
        <Text style={[styles.verifyButtonText, { color: "white" }]}>
          Verify
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onResendCode}>
        <Text style={{ color: "#007bff", textAlign: "center", marginTop: 10 }}>
          Didn’t receive a code? Resend
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "grey",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    width: 40,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 1,
  },
  verifyButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default VerificationModal;
