import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

const BusOwnerMyBuses = () => {
  const navigation = useNavigation();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [newBus, setNewBus] = useState({
    name: "",
    number: "",
    RouteNo: "",
    seats: "",
    contact: "",
  });

  const [editingBusId, setEditingBusId] = useState(null);
  const [editedBus, setEditedBus] = useState({});

  const busesCollection = collection(db, "buses");
  const routesCollection = collection(db, "routes");

  // Load buses
  useEffect(() => {
    const q = query(busesCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBuses(list);
      },
      (error) => {
        console.error("Error listening to buses: ", error);
        Alert.alert("Error", "Unable to load buses.");
      }
    );

    return () => unsubscribe();
  }, []);

  // Load routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const snapshot = await getDocs(routesCollection);
        const routeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routeList);
      } catch (error) {
        console.error("Error fetching routes:", error);
        Alert.alert("Error", "Unable to load route list.");
      }
    };
    fetchRoutes();
  }, []);

  // Add new bus
  const handleAddBus = async () => {
    if (!newBus.name.trim() || !newBus.number.trim() || !newBus.RouteNo.trim()) {
      Alert.alert("Validation", "Please enter Bus Name, Number, and Route No.");
      return;
    }

    const busData = {
      name: newBus.name.trim(),
      number: newBus.number.trim(),
      RouteNo: newBus.RouteNo.trim(),
      seats: Number(newBus.seats) || 0,
      contact: newBus.contact.trim() || "",
      status: "Active",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(busesCollection, busData);
      setNewBus({ name: "", number: "", RouteNo: "", seats: "", contact: "" });
    } catch (error) {
      console.error("Error adding bus:", error);
      Alert.alert("Error", "Could not add bus.");
    }
  };

  // Edit bus
  const handleEdit = (bus) => {
    setEditingBusId(bus.id);
    setEditedBus({
      name: bus.name || "",
      number: bus.number || "",
      RouteNo: bus.RouteNo || "",
      seats: String(bus.seats || ""),
      contact: bus.contact || "",
      status: bus.status || "Active",
    });
  };

  const handleSave = async () => {
    if (!editingBusId) return;
    if (!editedBus.name.trim() || !editedBus.number.trim()) {
      Alert.alert("Validation", "Please enter Bus Name and Bus Number.");
      return;
    }

    try {
      const busDocRef = doc(db, "buses", editingBusId);
      await updateDoc(busDocRef, {
        name: editedBus.name.trim(),
        number: editedBus.number.trim(),
        RouteNo: editedBus.RouteNo.trim(),
        seats: Number(editedBus.seats) || 0,
        contact: editedBus.contact.trim(),
        status: editedBus.status || "Active",
        updatedAt: serverTimestamp(),
      });
      setEditingBusId(null);
      setEditedBus({});
    } catch (error) {
      console.error("Error updating bus:", error);
      Alert.alert("Error", "Could not save changes.");
    }
  };

  const handleDelete = (busId) => {
    Alert.alert("Delete Bus", "Are you sure you want to delete this bus?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const busDocRef = doc(db, "buses", busId);
            await deleteDoc(busDocRef);
          } catch (error) {
            console.error("Error deleting bus:", error);
            Alert.alert("Error", "Could not delete bus.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32, paddingTop: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Buses</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Add New Bus Form */}
      <Text style={styles.addBusTitle}>Add New Bus</Text>
      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            placeholder="Bus Name"
            style={[styles.input, { marginRight: 8 }]}
            value={newBus.name}
            onChangeText={(text) => setNewBus({ ...newBus, name: text })}
            placeholderTextColor="#555"
          />
          <TextInput
            placeholder="Bus Number"
            style={styles.input}
            value={newBus.number}
            onChangeText={(text) => setNewBus({ ...newBus, number: text })}
            placeholderTextColor="#555"
          />
        </View>

        <Picker
          selectedValue={newBus.RouteNo}
          onValueChange={(value) => setNewBus({ ...newBus, RouteNo: value })}
          style={[styles.input, { marginBottom: 12 }]}
        >
          <Picker.Item label="Select Route No" value="" />
          {routes.map((route) => (
            <Picker.Item
              key={route.id}
              label={`${route.RouteNo} (${route.origin} → ${route.destination}, ${route.service_type}, Rs.${route.fare})`}
              value={route.RouteNo}
            />
          ))}
        </Picker>

        <TextInput
          placeholder="Number of Seats"
          style={[styles.input, { marginBottom: 12 }]}
          keyboardType="numeric"
          value={newBus.seats}
          onChangeText={(text) => setNewBus({ ...newBus, seats: text })}
          placeholderTextColor="#555"
        />

        <TextInput
          placeholder="Contact Number"
          style={[styles.input, { marginBottom: 16 }]}
          keyboardType="phone-pad"
          value={newBus.contact}
          onChangeText={(text) => setNewBus({ ...newBus, contact: text })}
          placeholderTextColor="#555"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddBus}>
          <Text style={styles.addButtonText}>+ Add Bus</Text>
        </TouchableOpacity>
      </View>

      {/* Bus List */}
      {buses.map((bus) => (
        <View key={bus.id} style={styles.busCard}>
          {editingBusId === bus.id ? (
            <>
              <TextInput
                style={styles.input}
                value={editedBus.name}
                onChangeText={(text) => setEditedBus({ ...editedBus, name: text })}
                placeholder="Bus Name"
                placeholderTextColor="#555"
              />
              <TextInput
                style={styles.input}
                value={editedBus.number}
                onChangeText={(text) => setEditedBus({ ...editedBus, number: text })}
                placeholder="Bus Number"
                placeholderTextColor="#555"
              />

              <Picker
                selectedValue={editedBus.RouteNo}
                onValueChange={(value) => setEditedBus({ ...editedBus, RouteNo: value })}
                style={styles.input}
              >
                <Picker.Item label="Select Route No" value="" />
                {routes.map((route) => (
                  <Picker.Item
                    key={route.id}
                    label={`${route.RouteNo} (${route.origin} → ${route.destination}, ${route.service_type}, Rs.${route.fare})`}
                    value={route.RouteNo}
                  />
                ))}
              </Picker>

              <TextInput
                style={styles.input}
                value={String(editedBus.seats)}
                onChangeText={(text) => setEditedBus({ ...editedBus, seats: text })}
                placeholder="Seats"
                keyboardType="numeric"
                placeholderTextColor="#555"
              />
              <TextInput
                style={styles.input}
                value={editedBus.contact}
                onChangeText={(text) => setEditedBus({ ...editedBus, contact: text })}
                placeholder="Contact"
                keyboardType="phone-pad"
                placeholderTextColor="#555"
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, marginRight: 8 }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { flex: 1 }]}
                  onPress={() => {
                    setEditingBusId(null);
                    setEditedBus({});
                  }}
                >
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.busHeader}>
                <Text style={styles.busName}>{bus.name}</Text>
                <Text style={styles.status}>{bus.status}</Text>
              </View>
              <Text style={styles.busNumber}>{bus.number}</Text>
              <Text style={styles.busDetail}>Route No: {bus.RouteNo}</Text>
              <Text style={styles.busDetail}>Contact: {bus.contact}</Text>
              <Text style={styles.busDetail}>{bus.seats} seats</Text>

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.editButton, { marginRight: 8, flex: 1 }]}
                  onPress={() => handleEdit(bus)}
                >
                  <Text style={styles.editButtonText}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: "#ffdddd", flex: 1 }]}
                  onPress={() => handleDelete(bus.id)}
                >
                  <Text style={[styles.editButtonText, { color: "#b00020" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default BusOwnerMyBuses;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E35B1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  busCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },
  busHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  busName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  status: { fontSize: 12, color: "#28A745", fontWeight: "bold" },
  busNumber: { fontSize: 14, fontWeight: "600", marginBottom: 2, color: "#555" },
  busDetail: { fontSize: 14, color: "#555", marginBottom: 2 },
  editButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  editButtonText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  saveButton: {
    backgroundColor: "#5E35B1",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  addBusTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 12, color: "#333" },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  input: {
    backgroundColor: "#F1F1F1",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    color: "#000",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#5E35B1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
