// authScreen/passenger/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  const [walletAmount, setWalletAmount] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWalletAmount(data.walletAmount || 0);
        setUsername(data.username || user.displayName || 'User');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("PassengerSignIn");
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Failed to logout. Try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Exit ✖</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Icon + Username */}
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={require('../../assets/profile.png')}
            style={styles.profileIcon}
          />
          <Text style={styles.greeting}>Hi, {username}</Text>
        </TouchableOpacity>

        {/* Wallet Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wallet Balance</Text>
          <Text style={styles.amount}>LKR {walletAmount}</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QR')}>
            <Image source={require('../../assets/qr.png')} style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>My QR Code</Text>
            <Image source={require('../../assets/arrow.png')} style={styles.buttonIconRight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddMoney')}>
            <Image source={require('../../assets/addmoney.png')} style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>Add Money</Text>
            <Image source={require('../../assets/arrow.png')} style={styles.buttonIconRight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Summary')}>
            <Image source={require('../../assets/summary.png')} style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>Summary</Text>
            <Image source={require('../../assets/arrow.png')} style={styles.buttonIconRight} />
          </TouchableOpacity>
        </View>

        {/* Recent Trips Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Trips</Text>
          <View style={styles.tripItem}>
            <Text style={styles.tripText}>Bus 120 → 14 Oct 2025 → LKR 150</Text>
          </View>
          <View style={styles.tripItem}>
            <Text style={styles.tripText}>Bus 45 → 12 Oct 2025 → LKR 200</Text>
          </View>
          <View style={styles.tripItem}>
            <Text style={styles.tripText}>Bus 88 → 10 Oct 2025 → LKR 180</Text>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  header: {
    width: '100%',
    maxWidth: 350,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerButton: { padding: 10, backgroundColor: '#1e90ff', borderRadius: 8 },
  headerButtonText: { color: '#fff', fontWeight: '600' },
  headerImage: { width: 250, height: 150, marginLeft: 35 },
  profileContainer: { width: '100%', marginBottom: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  profileIcon: { width: 30, height: 30 },
  greeting: { marginLeft: 10, fontSize: 18, fontWeight: '600', color: '#333' },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTitle: { fontSize: 28, fontWeight: '600', marginBottom: 10, color: '#333' },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#1e90ff' },
  buttonContainer: { width: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e90ff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonIconLeft: { width: 45, height: 45, marginRight: 10 },
  buttonIconRight: { width: 40, height: 40, marginLeft: 10, resizeMode: 'contain' },
  buttonText: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 25, textAlign: 'left' },
  tripItem: { width: '100%', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tripText: { fontSize: 16, color: '#333' },
});
