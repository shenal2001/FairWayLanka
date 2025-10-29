// authScreen/owner/OwnerSignIn.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function OwnerSignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔍 Fetch email suggestions after typing 3+ letters
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (email.length >= 3) {
        try {
          const ownersRef = collection(db, "owners");
          const q = query(ownersRef, where("email", ">=", email), where("email", "<=", email + "\uf8ff"));
          const querySnapshot = await getDocs(q);
          const emailList = querySnapshot.docs.map(doc => doc.data().email);
          setSuggestions(emailList);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching email suggestions:", error);
        }
      } else {
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [email]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "owners", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.category === "owner") {
          Alert.alert("Success", "Owner signed in!");
          navigation.navigate("BusOwnerMain");
        } else {
          await signOut(auth);
          Alert.alert("Access Denied", "You are not registered as an owner.");
        }
      } else {
        await signOut(auth);
        Alert.alert("Error", "User data not found. Please sign up first.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSuggestionPress = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Sign In</Text>

      {/* Email Input with Suggestions */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {showSuggestions && (
          <View style={styles.suggestionsBox}>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Password Input with Eye Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity onPress={() => navigation.navigate("OwnerSignUp")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F9F9FF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#4B0082" },
  inputContainer: { width: "100%", position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingRight: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  eyeIcon: {
    paddingHorizontal: 6,
  },
  button: {
    backgroundColor: "#4B0082",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  link: { color: "#4B0082", textAlign: "center", marginTop: 10 },
  suggestionsBox: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    zIndex: 10,
    maxHeight: 120,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
