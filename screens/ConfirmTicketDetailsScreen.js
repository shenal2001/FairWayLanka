import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const ConfirmTicketDetailsScreen = ({ navigation, route }) => {
  const { 
    personCount, 
    pickupLocation, 
    destination, 
    conductorBusNum,  
    conductorRouteNo, 
    serviceType, 
    fare, 
    ticketNumber
  } = route.params;

  const now = new Date();
  const date = `${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
  const time = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  // ✅ Navigate with fare details
  const handleGenerateTicket = () => {
    navigation.navigate('ScanQRCode', { fare, ticketNumber });
  };

  const formatServiceType = (type) => {
    if (!type) return 'N/A';
    let formatted = type.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <View style={styles.container}>
      <Header title="Confirm Ticket Details" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Persons</Text>
            <Text style={styles.detailValue}>{personCount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup from</Text>
            <Text style={styles.detailValue}>{pickupLocation}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{destination}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bus Num</Text>
            <Text style={styles.detailValue}>{conductorBusNum}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Route</Text>
            <Text style={styles.detailValue}>{conductorRouteNo}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Type</Text>
            <Text style={styles.detailValue}>{formatServiceType(serviceType)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{time}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ticket Num</Text>
            <Text style={styles.detailValue}>{ticketNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fare +Tax</Text>
            <Text style={styles.detailValue}>Rs. {fare}</Text>
          </View>

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateTicket}>
            <Text style={styles.generateButtonText}>Generate Ticket & Scan QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  scrollContent: { paddingBottom: height * 0.05, alignItems: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: width * 0.05,
    width: '90%',
    marginVertical: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: { fontSize: width * 0.06, fontWeight: 'bold', color: '#333', marginBottom: height * 0.02 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: { fontSize: width * 0.04, color: '#666', flex: 1 },
  detailValue: { fontSize: width * 0.045, fontWeight: '600', color: '#333', flex: 1.5, textAlign: 'right' },
  generateButton: { backgroundColor: '#6A1B9A', borderRadius: 10, paddingVertical: height * 0.02, alignItems: 'center', marginTop: height * 0.03 },
  generateButtonText: { color: 'white', fontSize: width * 0.05, fontWeight: 'bold' },
});

export default ConfirmTicketDetailsScreen;
