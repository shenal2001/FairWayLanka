// authScreen/first.js
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function First() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require("../assets/bg.png")} style={styles.bg} />
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard")} // Navigate to Dashboard
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  bg: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  logo: { width: 150, height: 150, marginBottom: 50, resizeMode: "contain" },
  button: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
