import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Platform, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import { db } from '../authScreen/firebase';
import {
  collection, addDoc, serverTimestamp, getDocs, query,
  doc, getDoc, onSnapshot, where, Timestamp
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const EnterTicketDetailsScreen = ({ route, navigation }) => {
  const { conductorId } = route.params; // 👈 Get conductorId from navigation params

  const [headerBusNumber, setHeaderBusNumber] = useState('');
  const [headerRoute, setHeaderRoute] = useState('Loading...');
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalFare, setTotalFare] = useState(0);
  const [allRoutes, setAllRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [farePerPerson, setFarePerPerson] = useState(0);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [currentTicketRouteNo, setCurrentTicketRouteNo] = useState('');
  const [currentTicketRouteName, setCurrentTicketRouteName] = useState('');
  const [personCount, setPersonCount] = useState('');
  const [pickupLocation, setPickupLocation] = useState('select');
  const [destination, setDestination] = useState('select');
  const [serviceType, setServiceType] = useState('select');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // --- 1. Fetch Conductor Details (Bus Number & Route) ---
  useEffect(() => {
    const fetchConductorData = async () => {
      try {
        if (!conductorId) {
          Alert.alert("Error", "Missing conductor ID.");
          return;
        }

        const conductorDoc = await getDoc(doc(db, "conductors", conductorId));
        if (!conductorDoc.exists()) {
          Alert.alert("Error", "Conductor not found in database.");
          setIsFetchingData(false);
          return;
        }

        const conductorData = conductorDoc.data();
        const busNum = conductorData.busNumber;

        if (!busNum) {
          Alert.alert("Error", "Bus number not assigned for this conductor.");
          setIsFetchingData(false);
          return;
        }

        setHeaderBusNumber(busNum);
        await fetchBusAndRouteData(busNum);

      } catch (error) {
        console.error("Error fetching conductor details:", error);
        Alert.alert("Error", "Failed to fetch conductor data.");
      }
    };

    fetchConductorData();
  }, [conductorId]);

  // --- 2. Fetch Bus and Route Data based on Bus Number ---
  const fetchBusAndRouteData = async (busNum) => {
    try {
      const busQuery = query(collection(db, "buses"), where("number", "==", busNum));
      const busQuerySnapshot = await getDocs(busQuery);

      if (busQuerySnapshot.empty) {
        setHeaderRoute('Bus not found');
        setIsFetchingData(false);
        Alert.alert("Error", `Bus number ${busNum} not found.`);
        return;
      }

      const busDoc = busQuerySnapshot.docs[0];
      const busRouteId = busDoc.data().RouteNo;
      setHeaderRoute(busRouteId);

      const routesQuery = query(collection(db, "routes"), where("RouteNo", "==", busRouteId));
      const querySnapshot = await getDocs(routesQuery);

      const routesData = [];
      const locationSet = new Set();
      const serviceTypeSet = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        routesData.push(data);
        locationSet.add(data.origin);
        locationSet.add(data.destination);
        serviceTypeSet.add(data.service_type);
      });

      setAllRoutes(routesData);
      setLocations(['Select Location', ...locationSet]);
      setServiceTypes(['Select Service', ...serviceTypeSet]);
    } catch (error) {
      console.error("Error fetching bus/route data:", error);
      Alert.alert("Error", "Could not load bus or route data.");
    } finally {
      setIsFetchingData(false);
    }
  };

  // --- 3. Real-time Listener for Today's Tickets ---
  useEffect(() => {
    if (!headerBusNumber) return;
    const ticketsCollection = collection(db, 'tickets');
    const q = query(ticketsCollection, where("busnum", "==", headerBusNumber));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fareSum = 0;
      let count = 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      querySnapshot.forEach((doc) => {
        const ticketData = doc.data();
        const createdAtTimestamp = ticketData.createdAt;

        if (createdAtTimestamp instanceof Timestamp) {
          const createdAtDate = createdAtTimestamp.toDate();
          if (createdAtDate >= todayStart && createdAtDate < todayEnd) {
            count++;
            const fare = ticketData.fare;
            if (typeof fare === 'number') fareSum += fare;
          }
        }
      });

      setTotalTickets(count);
      setTotalFare(fareSum);
    }, (error) => {
      console.error("Error listening to tickets: ", error);
      Alert.alert("Error", "Could not connect to ticket listener.");
    });

    return () => unsubscribe();
  }, [headerBusNumber]);

  // --- 4. Route & Fare Calculation ---
  useEffect(() => {
    if (pickupLocation === 'select' || destination === 'select' || serviceType === 'select') {
      setFarePerPerson(0);
      setCalculatedFare(0);
      setCurrentTicketRouteNo('');
      setCurrentTicketRouteName('');
      return;
    }

    if (allRoutes.length > 0) {
      const findRoute = allRoutes.find(routeDoc => {
        const direction1 = routeDoc.origin === pickupLocation && routeDoc.destination === destination;
        const direction2 = routeDoc.origin === destination && routeDoc.destination === pickupLocation;
        return (direction1 || direction2) && routeDoc.service_type === serviceType;
      });

      if (findRoute) {
        setFarePerPerson(findRoute.fare);
        const count = parseFloat(personCount || 0);
        setCalculatedFare(count * findRoute.fare);
        setCurrentTicketRouteNo(findRoute.RouteNo);
        setCurrentTicketRouteName(`${findRoute.origin} - ${findRoute.destination}`);
      } else {
        setFarePerPerson(0);
        setCalculatedFare(0);
        setCurrentTicketRouteNo('');
        setCurrentTicketRouteName('');
      }
    }
  }, [pickupLocation, destination, serviceType, personCount, allRoutes]);

  // --- 5. Handle Confirm Button ---
  const handleConfirm = async () => {
    if (personCount === '' || parseFloat(personCount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid person count.');
      return;
    }
    if (pickupLocation === 'select' || destination === 'select' || serviceType === 'select') {
      Alert.alert('Invalid Input', 'Please select Pickup, Destination, and Service Type.');
      return;
    }
    if (farePerPerson === 0 || currentTicketRouteName === '') {
      Alert.alert('No Route Match', 'No matching route found. Please verify selections.');
      return;
    }

    setIsLoading(true);
    try {
      const ticketData = {
        personCount: parseInt(personCount),
        pickupLocation,
        destination,
        serviceType,
        routenum: headerRoute,
        busnum: headerBusNumber,
        route: currentTicketRouteName,
        fare: calculatedFare,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'tickets'), ticketData);
      console.log("Ticket saved with ID: ", docRef.id);

      navigation.navigate('ConfirmTicketDetails', {
        personCount,
        pickupLocation,
        destination,
        conductorBusNum: headerBusNumber,
        conductorRouteNo: headerRoute,
        serviceType,
        fare: calculatedFare.toFixed(2),
        ticketNumber: docRef.id
      });

      setPersonCount('');
      setPickupLocation('select');
      setDestination('select');
      setServiceType('select');
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Failed to save ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 6. UI Rendering ---
  if (isFetchingData) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Loading Data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Conductor Details" showBackButton={false} />

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
              <Text style={styles.infoLabel}>Today's Tickets</Text>
              <Text style={styles.infoValue}>{totalTickets}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Fare</Text>
              <Text style={styles.infoValue}>Rs. {totalFare.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Details</Text>

          <Text style={styles.inputLabel}>Person Count</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={personCount}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setPersonCount(numericText);
              setCalculatedFare(parseFloat(numericText || 0) * farePerPerson);
            }}
            placeholder="e.g., 4"
            placeholderTextColor="#999"
          />

          {/* Pickup */}
          <Text style={styles.inputLabel}>Pickup Location</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={pickupLocation} onValueChange={setPickupLocation} style={styles.picker}>
              {locations.map((loc, index) => (
                <Picker.Item
                  key={index}
                  label={loc}
                  value={index === 0 ? 'select' : loc}
                  enabled={index !== 0}
                  style={index === 0 ? styles.pickerPlaceholder : styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          {/* Destination */}
          <Text style={styles.inputLabel}>Destination</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={destination} onValueChange={setDestination} style={styles.picker}>
              {locations.map((loc, index) => (
                <Picker.Item
                  key={index}
                  label={loc}
                  value={index === 0 ? 'select' : loc}
                  enabled={index !== 0}
                  style={index === 0 ? styles.pickerPlaceholder : styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          {/* Service Type */}
          <Text style={styles.inputLabel}>Service Type</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={serviceType} onValueChange={setServiceType} style={styles.picker}>
              {serviceTypes.map((type, index) => (
                <Picker.Item
                  key={index}
                  label={type}
                  value={index === 0 ? 'select' : type}
                  enabled={index !== 0}
                  style={index === 0 ? styles.pickerPlaceholder : styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.fareDisplayContainer}>
            <Text style={styles.fareLabel}>Total Fare:</Text>
            <Text style={styles.fareValue}>Rs. {calculatedFare.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, isLoading && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>Confirm</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* same styles from your code */
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#6A1B9A' },
  scrollContent: { paddingBottom: height * 0.05, alignItems: 'center' },
  conductorInfoCard: { backgroundColor: 'white', borderRadius: 15, marginVertical: 20, width: '90%', padding: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  infoBox: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 14, color: '#666', marginBottom: 5, textAlign: 'center' },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, width: '90%', marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  inputLabel: { fontSize: 16, color: '#444', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden', marginBottom: 10 },
  picker: { height: Platform.OS === 'ios' ? 120 : 50 },
  pickerPlaceholder: { color: '#999' },
  pickerItem: { color: '#333' },
  fareDisplayContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, backgroundColor: '#F0F0F0', padding: 10, borderRadius: 8 },
  fareLabel: { fontSize: 16, color: '#555', fontWeight: '500' },
  fareValue: { fontSize: 18, color: '#6A1B9A', fontWeight: '700' },
  confirmButton: { backgroundColor: '#6A1B9A', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 15 },
  confirmButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  disabledButton: { backgroundColor: '#BDBDBD' },
});

export default EnterTicketDetailsScreen;
