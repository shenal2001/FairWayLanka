import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native'; // ✅ import navigation hook

const QRScreen = () => {
  const navigation = useNavigation(); // ✅ initialize navigation
  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchExistingQRCode();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchExistingQRCode = async () => {
    try {
      const qrRef = doc(db, 'users', user.uid);
      const qrSnap = await getDoc(qrRef);

      if (qrSnap.exists() && qrSnap.data().qrCode) {
        setQrValue(qrSnap.data().qrCode);
      }
    } catch (error) {
      console.log('Error fetching QR:', error);
      Alert.alert('Error', 'Failed to load QR code data.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!user) {
      Alert.alert('Error', 'No logged-in user.');
      return;
    }

    setGenerating(true);

    try {
      const qrRef = doc(db, 'users', user.uid);
      const qrSnap = await getDoc(qrRef);

      if (qrSnap.exists() && qrSnap.data().qrCode) {
        setQrValue(qrSnap.data().qrCode);
        Alert.alert('Info', 'You already have a QR code.');
      } else {
        const uniqueValue = `QR-${user.uid.slice(0, 5).toUpperCase()}-${uuid.v4().slice(0, 8).toUpperCase()}`;

        await setDoc(
          qrRef,
          {
            username: user.displayName || 'Unknown User',
            email: user.email,
            qrCode: uniqueValue,
          },
          { merge: true }
        );

        setQrValue(uniqueValue);
        Alert.alert('Success', 'QR Code generated successfully!');
      }
    } catch (error) {
      console.log('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR Code. Check Firestore permissions.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 🔹 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeScreen')}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>

      <Image
        source={require('../../assets/logo.png')}
        style={styles.busImage}
        resizeMode="contain"
      />

      <Text style={styles.title}>My QR Code</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : qrValue ? (
        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={220} />
          <Text style={styles.qrNumberLabel}>QR Number</Text>
          <Text style={styles.qrNumber}>{qrValue}</Text>
        </View>
      ) : (
        <Text style={styles.info}>No QR code generated yet.</Text>
      )}

      <TouchableOpacity
        style={[styles.button, generating && { opacity: 0.7 }]}
        onPress={generateQRCode}
        disabled={generating}
      >
        <Text style={styles.buttonText}>
          {generating ? 'Generating...' : 'Generate QR Code'}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default QRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top:100,
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    fontSize:15,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1e90ff',
    marginBottom: 10,
    marginTop: 10,
  },
  qrContainer: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    elevation: 6,
  },
  qrNumberLabel: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  qrNumber: {
    fontSize: 16,
    color: '#1e90ff',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  info: {
    marginTop: 15,
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  busImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});


