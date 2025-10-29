import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you have expo vector icons installed

const { width } = Dimensions.get('window');

const Header = ({ title, onBackPress, showBackButton = true }) => {
  return (
    <View style={styles.headerContainer}>
      {showBackButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="white" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#6A1B9A', // Deep purple
    paddingTop: Platform.OS === 'android' ? 40 : 50, // Adjust for status bar
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: width * 0.04,
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
});

export default Header;