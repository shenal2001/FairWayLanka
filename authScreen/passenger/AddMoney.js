import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AddMoneyScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ ensure user is loaded safely
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      Alert.alert("Error", "You must be logged in to add money");
      navigation.goBack();
    }
  }, []);

  const handlePay = async () => {
    if (!amount || !cardNumber || !expiry || !cvv) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let currentQr = "";
      let currentBalance = 0;

      if (userSnap.exists()) {
        const data = userSnap.data();
        currentQr = data.qrCode || "";
        currentBalance = data.walletAmount || 0;
      }

      const newBalance = currentBalance + numericAmount;

      // ✅ safely merge updates in Firestore
      await setDoc(
        userRef,
        {
          walletAmount: newBalance,
          qrCode: currentQr,
          email: user.email,
          uid: user.uid,
        },
        { merge: true }
      );

      Alert.alert("Success", `LKR ${numericAmount} added!\nNew balance: LKR ${newBalance}`);
      navigation.goBack(); // ✅ navigate back to HomeScreen
    } catch (error) {
      console.error("Error updating wallet:", error);
      Alert.alert("Error", "Failed to add money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>⬅ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Money</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (LKR)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
          />
        </View>

        {/* Card Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="1234 5678 9012 3456"
          />
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              keyboardType="numeric"
              placeholder="MM/YY"
              maxLength={5}
              onChangeText={(text) => {
                let clean = text.replace(/\D/g, "");
                if (clean.length > 2) clean = clean.slice(0, 2) + "/" + clean.slice(2, 4);
                setExpiry(clean);
              }}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              keyboardType="numeric"
              onChangeText={setCvv}
              placeholder="123"
              secureTextEntry
              maxLength={3}
            />
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddMoneyScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f0f0" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 60,
    paddingVertical: 8,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
    alignItems: "center",
  },
  backText: { fontWeight: "600", color: "#fff" },
  headerTitle: { textAlign: "center", fontSize: 22, fontWeight: "600" },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardRow: { flexDirection: "row" },
  payButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
