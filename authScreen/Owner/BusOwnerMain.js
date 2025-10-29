import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const BusOwnerMain = () => {
  const navigation = useNavigation();

  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [revenueChange, setRevenueChange] = useState(null);
  const [todaysPassengers, setTodaysPassengers] = useState(0);
  const [passengerChange, setPassengerChange] = useState(null);

  const [activeConductors, setActiveConductors] = useState(0);
  const [totalConductors, setTotalConductors] = useState(0);
  const [totalBuses, setTotalBuses] = useState(0);

  useEffect(() => {
    try {
      const ticketsCollection = collection(db, 'tickets');
      const conductorsCollection = collection(db, 'conductors');
      const busesCollection = collection(db, 'buses');

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(endOfToday);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);

      const sumField = (snapshot, field) =>
        snapshot.docs.reduce((total, doc) => total + (doc.data()[field] || 0), 0);

      // Queries
      const qToday = query(
        ticketsCollection,
        where('createdAt', '>=', startOfToday),
        where('createdAt', '<=', endOfToday),
        orderBy('createdAt', 'desc')
      );

      const qYesterday = query(
        ticketsCollection,
        where('createdAt', '>=', startOfYesterday),
        where('createdAt', '<=', endOfYesterday),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeToday = onSnapshot(qToday, snapshotToday => {
        const todayRevenueTotal = sumField(snapshotToday, 'fare');
        const todayPassengerTotal = sumField(snapshotToday, 'personCount');

        setTodaysRevenue(todayRevenueTotal);
        setTodaysPassengers(todayPassengerTotal);

        // Yesterday's snapshot
        onSnapshot(qYesterday, snapshotYesterday => {
          const yesterdayRevenueTotal = sumField(snapshotYesterday, 'fare');
          const yesterdayPassengerTotal = sumField(snapshotYesterday, 'personCount');

          setRevenueChange(
            yesterdayRevenueTotal === 0
              ? null
              : ((todayRevenueTotal - yesterdayRevenueTotal) / yesterdayRevenueTotal * 100).toFixed(1)
          );

          setPassengerChange(
            yesterdayPassengerTotal === 0
              ? null
              : ((todayPassengerTotal - yesterdayPassengerTotal) / yesterdayPassengerTotal * 100).toFixed(1)
          );
        }, error => {
          console.log('Yesterday snapshot error:', error.message);
        });
      }, error => {
        console.log('Today snapshot error:', error.message);
      });

      // Active Conductors
      const qActiveConductors = query(conductorsCollection, where('isLoggedIn', '==', true));
      const unsubscribeActive = onSnapshot(qActiveConductors, snapshot => {
        setActiveConductors(snapshot.docs.length);
      }, error => console.log('Active conductors error:', error.message));

      // Total conductors
      const unsubscribeTotalConductors = onSnapshot(conductorsCollection, snapshot => {
        setTotalConductors(snapshot.docs.length);
      }, error => console.log('Total conductors error:', error.message));

      // Total buses
      const unsubscribeTotalBuses = onSnapshot(busesCollection, snapshot => {
        setTotalBuses(snapshot.docs.length);
      }, error => console.log('Total buses error:', error.message));

      return () => {
        unsubscribeToday();
        unsubscribeActive();
        unsubscribeTotalConductors();
        unsubscribeTotalBuses();
      };
    } catch (err) {
      console.log('Firestore error:', err.message);
      Alert.alert('Error', 'Cannot fetch data from Firestore. Check rules & authentication.');
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.backArrow}>←Back</Text>
        </TouchableOpacity>
        <View style={styles.icons}>
          <Ionicons
            name="person-circle-outline"
            size={32}
            color="#5E35B1"
            onPress={() => navigation.navigate('BusOwnerAc')}
          />
          <Ionicons name="log-out-outline" size={32} color="#5E35B1" style={{ marginLeft: 12 }} />
        </View>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>FareWay Lanka</Text>
        <Text style={styles.subtitle}>PVT (LTD)</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('BusOwnerMyBuses')}>
          <Text style={styles.buttonText}>My Buses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('Banking')}>
          <Text style={styles.buttonText}>Banking Details</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.mainButton, { alignSelf: 'center', width: '92%', marginBottom: 8 }]}
        onPress={() => navigation.navigate('ConductorManagement')}
      >
        <Text style={styles.buttonText}>Conductor Management</Text>
      </TouchableOpacity>

      {/* Info Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Revenue</Text>
          <Text style={styles.cardValue}>Rs. {todaysRevenue.toLocaleString()}</Text>
          <Text style={styles.cardSub}>
            {revenueChange === null
              ? 'No data from yesterday'
              : revenueChange >= 0
              ? `↑ ${revenueChange}% from yesterday`
              : `↓ ${Math.abs(revenueChange)}% from yesterday`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Buses</Text>
          <Text style={styles.cardValue}>{activeConductors}</Text>
          <Text style={styles.cardSub}>{totalBuses} registered</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Passengers Today</Text>
          <Text style={styles.cardValue}>{todaysPassengers}</Text>
          <Text style={styles.cardSub}>
            {passengerChange === null
              ? 'No data from yesterday'
              : passengerChange >= 0
              ? `↑ ${passengerChange}% from yesterday`
              : `↓ ${Math.abs(passengerChange)}% from yesterday`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Conductors</Text>
          <Text style={styles.cardValue}>{activeConductors}</Text>
          <Text style={styles.cardSub}>{totalConductors} registered</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default BusOwnerMain;

// Styles (unchanged)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  backArrow: { fontSize: 20, color: '#5E35B1' , marginTop:30},
  icons: { flexDirection: 'row', alignItems: 'center' ,marginTop:50},
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 80, height: 80, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#5E35B1' },
  subtitle: { fontSize: 12, color: '#555' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  mainButton: { backgroundColor: '#5E35B1', paddingVertical: 14, borderRadius: 12, width: '48%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardsContainer: { marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#555', textAlign: 'center' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#5E35B1' },
  cardSub: { fontSize: 12, color: '#28A745', marginTop: 4, textAlign: 'center' }
});
