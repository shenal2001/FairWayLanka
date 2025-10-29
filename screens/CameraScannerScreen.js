import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const CameraScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    setScannedData(data);
    console.log(`Scanned Code: Type=${type}, Data=${data}`);
    
    // Show alert and navigate back with data
    Alert.alert(
      'QR Code Scanned!', 
      `Data: ${data}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back and pass the scanned data
            navigation.navigate('ScanQRCode', { 
              scannedData: data,
              scannedType: type,
              timestamp: Date.now()
            });
          }
        }
      ]
    );
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedData('');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button 
          title={'Grant Permission'} 
          onPress={requestPermission} 
          color="#6A1B9A"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.topLeftCorner} />
        <View style={styles.topRightCorner} />
        <View style={styles.bottomLeftCorner} />
        <View style={styles.bottomRightCorner} />
        <Text style={styles.overlayText}>
          {scanned ? `Scanned: ${scannedData}` : 'Scan QR Code'}
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  permissionText: { 
    fontSize: 18, 
    color: 'white', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    padding: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 25, 
    zIndex: 10 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlayText: { 
    color: 'white', 
    fontSize: 16, 
    textAlign: 'center', 
    position: 'absolute', 
    bottom: '15%', 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 5, 
    maxWidth: '80%' 
  },
  topLeftCorner: { 
    position: 'absolute', 
    top: '25%', 
    left: '10%', 
    width: 50, 
    height: 50, 
    borderTopWidth: 4, 
    borderLeftWidth: 4, 
    borderColor: 'white' 
  },
  topRightCorner: { 
    position: 'absolute', 
    top: '25%', 
    right: '10%', 
    width: 50, 
    height: 50, 
    borderTopWidth: 4, 
    borderRightWidth: 4, 
    borderColor: 'white' 
  },
  bottomLeftCorner: { 
    position: 'absolute', 
    bottom: '25%', 
    left: '10%', 
    width: 50, 
    height: 50, 
    borderBottomWidth: 4, 
    borderLeftWidth: 4, 
    borderColor: 'white' 
  },
  bottomRightCorner: { 
    position: 'absolute', 
    bottom: '25%', 
    right: '10%', 
    width: 50, 
    height: 50, 
    borderBottomWidth: 4, 
    borderRightWidth: 4, 
    borderColor: 'white' 
  },
  scanAgainButton: { 
    position: 'absolute', 
    bottom: 50, 
    backgroundColor: '#6A1B9A', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 8, 
    zIndex: 10 
  },
  scanAgainText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default CameraScannerScreen;