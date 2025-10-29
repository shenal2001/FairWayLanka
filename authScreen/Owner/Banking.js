// authScreen/owner/Banking.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const Banking = () => {
  const navigation = useNavigation();
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [wallet, setWallet] = useState("0.00");
  const [loading, setLoading] = useState(false);

  // Replace with authenticated owner's UID (you will later use auth.currentUser.uid)
  const ownerId = "owner123";

  // ✅ Fetch owner's data (bank + wallet)
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const docRef = doc(db, "owners", ownerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBank(data.bank || "");
          setAccountNumber(data.accountNumber || "");
          setWallet((data.wallet || 0).toFixed(2).toString());
        } else {
          console.log("No owner data found.");
        }
      } catch (error) {
        console.error("Error fetching owner details: ", error);
        Alert.alert("Error", "Failed to load data. Try again later.");
      }
    };

    fetchOwnerDetails();
  }, []);

  // ✅ Handle Bank Details Update (only bank + account number)
  const handleUpdateBankDetails = async () => {
    if (!bank || !accountNumber) {
      Alert.alert("Error", "Please fill all fields before saving.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "owners", ownerId);
      await setDoc(
        docRef,
        { bank, accountNumber },
        { merge: true }
      );

      setLoading(false);
      Alert.alert("Success", "Bank details updated successfully!");
    } catch (error) {
      console.error("Error updating bank details:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to update details. Please try again.");
    }
  };

  // ✅ Handle Wallet Transfer (reset wallet to 0 after transfer)
  const handleTransfer = async () => {
    if (parseFloat(wallet) <= 0) {
      Alert.alert("Error", "No funds available to transfer.");
      return;
    }
    if (!bank || !accountNumber) {
      Alert.alert("Error", "Please set up your bank account first.");
      return;
    }

    Alert.alert(
      "Confirm Transfer",
      `Transfer Rs. ${wallet} to your ${bank.toUpperCase()} account ending in ${accountNumber.slice(-4)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              const docRef = doc(db, "owners", ownerId);
              await updateDoc(docRef, { wallet: 0 });
              setWallet("0.00");
              setLoading(false);
              Alert.alert("Success", "Funds transferred successfully!");
            } catch (error) {
              console.error("Error transferring funds:", error);
              setLoading(false);
              Alert.alert("Error", "Transfer failed. Try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>FareWay Lanka</Text>
        <Text style={styles.subtitle}>PVT (LTD)</Text>
      </View>

      {/* ✅ Wallet Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wallet</Text>

        <Text style={styles.walletLabel}>Current Balance</Text>
        <Text style={styles.walletAmount}>Rs. {wallet}</Text>

        <TouchableOpacity
          style={[styles.transferButton, loading && { backgroundColor: "#777" }]}
          onPress={handleTransfer}
          disabled={loading}
        >
          <Text style={styles.transferText}>
            {loading ? "Transferring..." : "Transfer"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Bank Settings Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bank Account Settings</Text>

        <Text style={styles.label}>Select Your Bank</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={bank}
            onValueChange={(value) => setBank(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Bank" value="" />
            <Picker.Item label="BOC" value="boc" />
            <Picker.Item label="People's Bank" value="peoples" />
            <Picker.Item label="Commercial Bank" value="commercial" />
            <Picker.Item label="Sampath Bank" value="sampath" />
          </Picker>
        </View>

        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account number"
          placeholderTextColor="#555"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#777" }]}
          onPress={handleUpdateBankDetails}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Save Bank Details"}
          </Text>
        </TouchableOpacity>
      </View>

      
    </ScrollView>
  );
};

export default Banking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    padding: 16,
  },
  backButton: { marginBottom: 10 },
  backArrow: {
    fontSize: 20,
    color: "#5E35B1",
    marginTop: 20,
    fontWeight: "bold",
  },
  logoContainer: { alignItems: "center", marginBottom: 20 },
  logo: { width: 70, height: 70, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "bold", color: "#5E35B1" },
  subtitle: { fontSize: 12, color: "#555" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 14, color: "#000", marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: "#EDE3FF",
    borderRadius: 10,
    marginBottom: 20,
  },
  picker: { height: 51 },
  input: {
    backgroundColor: "#EDE3FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    color: "#000",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#5E35B1",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  walletLabel: { fontSize: 16, color: "#333", marginBottom: 6, textAlign: "center" },
  walletAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 16,
  },
  transferButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  transferText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
