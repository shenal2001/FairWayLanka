// BusOwnerConMan.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

let Picker;
try {
  Picker = require('@react-native-picker/picker').Picker;
} catch (e) {
  Picker = null;
}

// Generate random password
const generatePassword = (length = 10) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
};

const ConductorManagement = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    empId: '',
    phone: '',
    email: '',
    assignedBus: '',
  });

  const [conductors, setConductors] = useState([]);
  const [buses, setBuses] = useState([]);

  const conductorsCollection = collection(db, 'conductors');
  const busesCollection = collection(db, 'buses');

  // Load buses for dropdown
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const snapshot = await getDocs(busesCollection);
        const busList = snapshot.docs.map((d) => ({
          id: d.id,
          label: `${d.data().number} - ${d.data().name}`,
          number: d.data().number,
          name: d.data().name,
        }));
        setBuses(busList);
        if (busList.length > 0 && !form.assignedBus) {
          setForm((prev) => ({ ...prev, assignedBus: busList[0].id }));
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
        Alert.alert('Error', 'Unable to load buses.');
      }
    };
    fetchBuses();
  }, []);

  // Load conductors in real-time
  useEffect(() => {
    const q = query(conductorsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setConductors(list);
      },
      (err) => console.error('Error listening to conductors:', err)
    );
    return () => unsubscribe();
  }, []);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleAddConductor = async () => {
    if (!form.name.trim() || !form.empId.trim() || !form.phone.trim()) {
      Alert.alert('Missing fields', 'Please fill Name, Employee ID, and Phone.');
      return;
    }

    const assignedBusObj = buses.find((b) => b.id === form.assignedBus);
    const busNumber = assignedBusObj ? assignedBusObj.number : form.assignedBus;

    const email = form.email?.trim() || `${form.empId.replace(/\s+/g, '')}@fareway.local`;
    const password = generatePassword(10);

    const conductorData = {
      name: form.name.trim(),
      empId: form.empId.trim(),
      phone: form.phone.trim(),
      email,
      assignedBus: form.assignedBus,
      busNumber,
      status: 'Active', // Show in active list
      isLoggedIn: false,
      passwordTemp: password,
      createdAt: serverTimestamp(),
    };

    try {
      // Create Auth user
      let authUid = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        authUid = userCredential.user.uid;
        conductorData.authUid = authUid;
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          Alert.alert(
            'Email Exists',
            'Conductor added to Firestore but auth user already exists.'
          );
        } else {
          console.error('Auth error:', authErr);
        }
      }

      // Add Firestore document
      await addDoc(conductorsCollection, conductorData);

      // Reset form
      setForm({
        name: '',
        empId: '',
        phone: '',
        email: '',
        assignedBus: buses.length > 0 ? buses[0].id : '',
      });

      Alert.alert(
        'Conductor Added',
        `Conductor ${conductorData.name} added.\n\nLogin email: ${email}\nPassword: ${password}`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not add conductor.');
    }
  };

  const handleRemove = (id) => {
    Alert.alert('Remove Conductor', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'conductors', id));
            Alert.alert('Removed', 'Conductor removed.');
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not remove conductor.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { marginTop: 20 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conductor Management</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Add New Conductor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Conductor</Text>

          <TextInput
            placeholder="Conductor Name"
            placeholderTextColor="#bdbdbd"
            style={styles.input}
            value={form.name}
            onChangeText={(t) => handleChange('name', t)}
          />
          <TextInput
            placeholder="Employee ID"
            placeholderTextColor="#bdbdbd"
            style={styles.input}
            value={form.empId}
            onChangeText={(t) => handleChange('empId', t)}
          />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#bdbdbd"
            keyboardType="phone-pad"
            style={styles.input}
            value={form.phone}
            onChangeText={(t) => handleChange('phone', t)}
          />
          <TextInput
            placeholder="Email (optional)"
            placeholderTextColor="#bdbdbd"
            keyboardType="email-address"
            style={styles.input}
            value={form.email}
            onChangeText={(t) => handleChange('email', t)}
          />

          {Picker && buses.length > 0 ? (
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={form.assignedBus}
                onValueChange={(val) => handleChange('assignedBus', val)}
                style={Platform.OS === 'android' ? styles.pickerAndroid : styles.pickerIos}
              >
                {buses.map((b) => (
                  <Picker.Item key={b.id} label={b.label} value={b.id} />
                ))}
              </Picker>
            </View>
          ) : (
            <TextInput
              placeholder="Assign to Bus"
              placeholderTextColor="#bdbdbd"
              style={styles.input}
              value={buses.find((b) => b.id === form.assignedBus)?.label || ''}
              editable={false}
            />
          )}

          <TouchableOpacity style={styles.cta} onPress={handleAddConductor}>
            <Text style={styles.ctaText}>Add Conductor & Create Login</Text>
          </TouchableOpacity>
        </View>

        {/* Active Conductors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Conductors</Text>

          {conductors.filter(c => c.status === 'Active').length === 0 ? (
            <Text style={styles.emptyText}>No active conductors.</Text>
          ) : (
            conductors
              .filter((c) => c.status === 'Active')
              .map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardName}>{c.name}</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>{c.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardInfo}>{c.empId}</Text>
                  <Text style={styles.cardInfo}>{c.busNumber}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#ffecec' }]}
                      onPress={() => handleRemove(c.id)}
                    >
                      <Text style={[styles.smallBtnText, { color: '#d32f2f' }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ConductorManagement;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5E35B1',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#222' },
  input: { backgroundColor: '#f1f1f1', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, marginBottom: 10, color: '#111' },
  pickerWrap: { backgroundColor: '#f1f1f1', borderRadius: 999, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  pickerAndroid: { height: 54, width: '100%', fontSize: 14 },
  pickerIos: { height: 150 },
  cta: { backgroundColor: '#5E35B1', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  ctaText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#777', paddingVertical: 8 },
  card: { backgroundColor: '#f6eeff', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', color: '#222' },
  statusPill: { backgroundColor: '#c5f6c9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { fontSize: 12, color: '#0b7a2b', fontWeight: '700' },
  cardInfo: { color: '#333', marginTop: 6, fontSize: 13 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  smallBtn: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, marginLeft: 8 },
  smallBtnText: { fontWeight: '700', fontSize: 12 },
});
