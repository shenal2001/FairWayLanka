import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const BusOwnerAc = () => {
  const navigation = useNavigation();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Use the correct collection name: 'busOwners'
        const docRef = doc(db, 'owners', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOwnerData(docSnap.data());
        } else {
          console.log('No owner data found for uid:', currentUser.uid);
        }
      } catch (error) {
        console.log('Error fetching owner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E35B1" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!ownerData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No owner data found!</Text>
        <Text>Make sure a Firestore document exists under <Text style={{ fontWeight: 'bold' }}>busOwners/{auth.currentUser?.uid}</Text></Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>My Profile</Text>

        <Image
          source={require('../../assets/logo.png')}
          style={styles.busImage}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Username</Text>
          <Text style={styles.cardValue}>{ownerData.username || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{ownerData.email || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Phone Number</Text>
          <Text style={styles.cardValue}>{ownerData.phone || 'N/A'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default BusOwnerAc;

// Styles (same as before)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { padding: 20, paddingTop: 40, alignItems: 'center', paddingBottom: 200 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, color: '#5E35B1' },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardLabel: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 5 },
  cardValue: { fontSize: 20, fontWeight: '500', color: '#5E35B1' },
  button: { marginTop: 30, backgroundColor: '#5E35B1', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  busImage: { width: 200, height: 120, alignSelf: 'center', marginTop: 40 },
});
