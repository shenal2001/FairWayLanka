import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../authScreen/firebase';
import {
  collection, query, where, onSnapshot, getDocs,
  doc, updateDoc, addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const ScanQRCodeScreen = ({ navigation, route }) => {
  const { fare = 0, ticketNumber = null } = route.params || {}; 
  const [headerBusNumber, setHeaderBusNumber] = useState('NB1234');
  const [headerRoute, setHeaderRoute] = useState('Loading...');
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalFare, setTotalFare] = useState(0);
  const [isFetchingHeaderData, setIsFetchingHeaderData] = useState(true);
  const [scannedQRData, setScannedQRData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Fetch Bus Route ---
  useEffect(() => {
    const fetchBusRoute = async () => {
      setIsFetchingHeaderData(true);
      try {
        const busQuery = query(collection(db, "buses"), where("number", "==", headerBusNumber));
        const busQuerySnapshot = await getDocs(busQuery);
        if (!busQuerySnapshot.empty) {
          const busDoc = busQuerySnapshot.docs[0];
          setHeaderRoute(busDoc.data().RouteNo);
        } else {
          setHeaderRoute('N/A');
        }
      } catch (error) {
        console.error("Error fetching bus route: ", error);
        setHeaderRoute('Error');
      } finally {
        setIsFetchingHeaderData(false);
      }
    };
    fetchBusRoute();
  }, [headerBusNumber]);

  // --- Real-time Ticket Totals ---
  useEffect(() => {
    const q = query(collection(db, 'tickets'), where("busnum", "==", headerBusNumber));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fareSum = 0;
      let count = 0;
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

      querySnapshot.forEach((docSnap) => {
        const ticketData = docSnap.data();
        const createdAtTimestamp = ticketData.createdAt;
        if (createdAtTimestamp instanceof Timestamp) {
          const createdAtDate = createdAtTimestamp.toDate();
          if (createdAtDate >= todayStart && createdAtDate < todayEnd) {
            count++;
            if (typeof ticketData.fare === 'number') fareSum += ticketData.fare;
          }
        }
      });
      setTotalTickets(count);
      setTotalFare(fareSum);
    }, (error) => {
      console.error("Error listening to tickets: ", error);
      Alert.alert("Listener Error", "Could not update totals.");
    });

    return () => unsubscribe();
  }, [headerBusNumber]);

  // --- Handle Scanned QR Data ---
  useEffect(() => {
    if (route.params?.scannedData) {
      const qrData = route.params.scannedData;
      console.log('Received scanned data:', qrData);
      setScannedQRData(qrData);
      navigation.setParams({ scannedData: undefined });
    }
  }, [route.params?.scannedData]);

  // --- Deduct Wallet based on QR ---
  const deductWalletByQR = async (qrData, fareAmount) => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('qrcode', '==', qrData));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("User not found", "Invalid QR code.");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      if (userData.walletAmount < fareAmount) {
        Alert.alert("Insufficient Balance", `Passenger wallet has Rs.${userData.walletAmount}, cannot deduct Rs.${fareAmount}.`);
        setLoading(false);
        return;
      }

      const newAmount = userData.walletAmount - fareAmount;
      await updateDoc(doc(db, 'users', userId), { walletAmount: newAmount });

      await addDoc(collection(db, 'tickets'), {
        fare: fareAmount,
        busnum: headerBusNumber,
        passengerId: userId,
        ticketNumber: ticketNumber || 'N/A',
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", `Rs.${fareAmount} deducted. New balance: Rs.${newAmount.toFixed(2)}`);
      setScannedQRData(null);

    } catch (error) {
      console.error("Error deducting wallet: ", error);
      Alert.alert("Error", "Failed to deduct wallet.");
    } finally {
      setLoading(false);
    }
  };

  // --- Open Camera Scanner ---
  const openScanner = () => {
    setScannedQRData(null);
    navigation.navigate('CameraScanner');
  };

  // --- Navigate to Enter Ticket Details ---
  const navigateToEnterDetails = () => {
    if (!scannedQRData) {
      Alert.alert("Scan QR", "Please scan a passenger QR code first.");
      return;
    }
    deductWalletByQR(scannedQRData, fare);
  };

  if (isFetchingHeaderData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Loading Bus Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Scan Passenger QR Code" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.conductorInfoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Bus Number</Text>
              <Text style={styles.infoValue}>{headerBusNumber}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Route No</Text>
              <Text style={styles.infoValue}>{headerRoute}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: 15 }]}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Today's Total Tickets</Text>
              <Text style={styles.infoValue}>{totalTickets}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Today's Total Fare</Text>
              <Text style={styles.infoValue}>Rs. {totalFare.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>QR Scanner</Text>
          <View style={styles.qrScannerFrame}>
            {scannedQRData ? (
              <View style={styles.scannedDataContainer}>
                <Ionicons name="checkmark-circle" size={width * 0.12} color="#4CAF50" />
                <Text style={styles.scannedDataTitle}>QR Code Scanned!</Text>
                <ScrollView style={styles.scannedDataScrollView}>
                  <Text style={styles.scannedDataText}>{scannedQRData}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.clearButton} onPress={() => setScannedQRData(null)}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderQR}>
                <Ionicons name="scan-outline" size={width * 0.15} color="#B0B0B0" />
                <Text style={styles.placeholderText}>Press button below{'\n'}to open camera</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.getCameraButton} onPress={openScanner}>
            <Text style={styles.getCameraButtonText}>{scannedQRData ? 'Scan New QR Code' : 'Get Camera Scanner'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={navigateToEnterDetails} disabled={loading}>
            <Text style={styles.confirmButtonText}>{loading ? 'Processing...' : 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#6A1B9A' },
  scrollContent: { paddingBottom: height * 0.03, alignItems: 'center' },
  conductorInfoCard: { backgroundColor: 'white', borderRadius: 15, marginVertical: height * 0.02, width: '90%', padding: width * 0.04, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  infoBox: { alignItems: 'center', paddingHorizontal: width * 0.01, flex: 1 },
  infoLabel: { fontSize: width * 0.035, color: '#666', marginBottom: 5, textAlign: 'center' },
  infoValue: { fontSize: width * 0.045, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: width * 0.05, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5, marginBottom: height * 0.03 },
  cardTitle: { fontSize: width * 0.055, fontWeight: 'bold', color: '#333', marginBottom: height * 0.025, textAlign: 'center' },
  qrScannerFrame: { width: width * 0.7, height: width * 0.7, borderColor: '#D0D0D0', borderWidth: 2, borderRadius: 10, borderStyle: 'dashed', alignSelf: 'center', marginTop: height * 0.02, marginBottom: height * 0.04, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8', overflow: 'hidden' },
  placeholderQR: { alignItems: 'center' },
  placeholderText: { fontSize: width * 0.038, color: '#B0B0B0', textAlign: 'center', marginTop: 10 },
  scannedDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, width: '100%' },
  scannedDataTitle: { fontSize: width * 0.045, fontWeight: 'bold', color: '#4CAF50', marginTop: 10, marginBottom: 10 },
  scannedDataScrollView: { maxHeight: width * 0.35, width: '100%', marginBottom: 10 },
  scannedDataText: { fontSize: width * 0.035, color: '#333', textAlign: 'center', lineHeight: 20 },
  clearButton: { backgroundColor: '#FF5722', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 5, marginTop: 5 },
  clearButtonText: { color: 'white', fontSize: width * 0.035, fontWeight: '600' },
  getCameraButton: { backgroundColor: 'black', borderRadius: 8, paddingVertical: height * 0.018, alignItems: 'center', marginBottom: height * 0.02 },
  getCameraButtonText: { color: 'white', fontSize: width * 0.045, fontWeight: '600' },
  confirmButton: { backgroundColor: '#6A1B9A', borderRadius: 8, paddingVertical: height * 0.018, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontSize: width * 0.045, fontWeight: '600' },
});

export default ScanQRCodeScreen;
