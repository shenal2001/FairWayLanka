import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Dashboard() {
  const navigation = useNavigation(); // React Navigation

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title and Subtitle */}
      <Text style={styles.title}>FareWay Lanka (Pvt) Ltd</Text>
      <Text style={styles.subtitle}>Smart Bus Payment System</Text>
      <Text style={styles.subtitleSmall}>
        Sri Lanka’s Digital Bus Ticketing Solution
      </Text>

      {/* How It Works Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How It Works</Text>

        <View style={styles.step}>
          <Text style={styles.stepText}>
            💳 Generate QR code linked to your bank account
          </Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepText}>🚌 Conductor scans your QR code</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepText}>
            🏦 Payment directly to bus depot/owner
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#007bff" }]}
        onPress={() => navigation.navigate("PassengerSignIn")}
      >
        <Text style={styles.buttonText}>Passenger App</Text>
      </TouchableOpacity>


        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={() => navigation.navigate("OwnerSignIn")} // Correct screen name
        >
          <Text style={styles.buttonText}>Businessman App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#800080" }]}
          onPress={() => navigation.navigate("ConductorSignin")} // Correct screen name
        >
          <Text style={styles.buttonText}>Conductor App</Text>
    </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4B0082",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  subtitleSmall: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    width: "90%",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  stepText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 5,
  },
  button: {
    width: "90%",
    paddingVertical: 14,
    borderRadius: 15,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});
