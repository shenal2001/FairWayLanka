import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No user data found!');
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading user details...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16 }}>No user data found!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        
      <ScrollView contentContainerStyle={styles.scrollContainer}>
         {/* Bus Image at Bottom Center */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.busImage}
        resizeMode="contain"
      />
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Username</Text>
          <Text style={styles.cardValue}>{userData.username}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{userData.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Phone Number</Text>
          <Text style={styles.cardValue}>{userData.phone}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    paddingBottom: 200, // extra space for bottom image
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1e90ff',
  },
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
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1e90ff',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  busImage: {
    width: 200,
    height: 120,
    position: 'top',
    alignSelf: 'center',
  },
});
