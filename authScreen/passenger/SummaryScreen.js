import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SummaryScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('daily');

  const data = {
    daily: { trips: 5, totalSales: 5, amount: 1200 },
    monthly: { trips: 100, totalSales: 95, amount: 25000 },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>⬅ Back</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Summary Text */}
        <View style={styles.content}>
          <Text style={styles.summaryText}>Summary</Text>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, selected === 'daily' && styles.activeToggle]}
            onPress={() => setSelected('daily')}
          >
            <Text style={[styles.toggleText, selected === 'daily' && styles.activeText]}>Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, selected === 'monthly' && styles.activeToggle]}
            onPress={() => setSelected('monthly')}
          >
            <Text style={[styles.toggleText, selected === 'monthly' && styles.activeText]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {selected === 'daily' ? 'Daily Summary' : 'Monthly Summary'}
          </Text>

          <Text style={styles.infoText}>Trips: {data[selected].trips}</Text>
          <Text style={styles.infoText}>Total Sales Count: {data[selected].totalSales}</Text>
          <Text style={styles.infoText}>Total Amount: LKR {data[selected].amount}</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
  },
  logo: {
    width: 150,
    height: 150,
  },
  content: {
    alignItems: 'center',
  },
  summaryText: {
    alignItems: 'center',
    backgroundColor: '#1e90ff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 30,
    fontWeight: '600',
    color: '#fff',
    width:'100%',
    textAlign:'center'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 8,
    width:'50%',
  },
  activeToggle: {
    backgroundColor: '#1e90ff',
  },
  toggleText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign:'center',
  },
  activeText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#1e90ff',
    fontWeight: '500',
  },
});
