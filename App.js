// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import First from "./authScreen/first";
import Dashboard from "./authScreen/dashboard";

// Passenger Screens
import PassengerSignIn from "./authScreen/passenger/PassengerSignIn";
import PassengerSignUp from "./authScreen/passenger/PassengerSignUp";
import HomeScreen from "./authScreen/passenger/HomeScreen";
import Profile from "./authScreen/passenger/Profile";
import AddMoney from "./authScreen/passenger/AddMoney";
import MyQRCodeScreen from "./authScreen/passenger/MyQRCodeScreen";
import SummaryScreen from './authScreen/passenger/SummaryScreen';

// Owner Screens
import OwnerSignIn from "./authScreen/Owner/OwnerSignIn";
import OwnerSignUp from "./authScreen/Owner/OwnerSignUp";
import BusOwnerMain from "./authScreen/Owner/BusOwnerMain";
import BusOwnerMyBuses from './authScreen/Owner/BusOwnerMyBuses';
import BusOwnerAc from "./authScreen/Owner/BusOwnerAc";
import Banking from './authScreen/Owner/Banking';
import ConductorManagement from './authScreen/Owner/ConductorManagement';

// Conductor Screens
import ConductorSignin from './screens/ConductorSignin';
import EnterTicketDetailsScreen from './screens/EnterTicketDetailsScreen';
import ConfirmTicketDetailsScreen from './screens/ConfirmTicketDetailsScreen';
import ScanQRCodeScreen from "./screens/ScanQRCodeScreen";
import CameraScannerScreen from "./screens/CameraScannerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth / Dashboard */}
        <Stack.Screen name="First" component={First} />
        <Stack.Screen name="Dashboard" component={Dashboard} />

        {/* Passenger */}
        <Stack.Screen name="PassengerSignIn" component={PassengerSignIn} />
        <Stack.Screen name="PassengerSignUp" component={PassengerSignUp} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="AddMoney" component={AddMoney} />
        <Stack.Screen name="QR" component={MyQRCodeScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />

        {/* Owner */}
        <Stack.Screen name="OwnerSignIn" component={OwnerSignIn} />
        <Stack.Screen name="OwnerSignUp" component={OwnerSignUp} />
        <Stack.Screen name="BusOwnerMain" component={BusOwnerMain} />
        <Stack.Screen name="BusOwnerMyBuses" component={BusOwnerMyBuses} />
        <Stack.Screen name="BusOwnerAc" component={BusOwnerAc} />
        <Stack.Screen name="Banking" component={Banking} />
        <Stack.Screen name="ConductorManagement" component={ConductorManagement} />

        {/* Conductor */}
        <Stack.Screen name="ConductorSignin" component={ConductorSignin} />
        <Stack.Screen name="EnterTicketDetailsScreen" component={EnterTicketDetailsScreen} />
        <Stack.Screen name="ConfirmTicketDetails" component={ConfirmTicketDetailsScreen} />
        <Stack.Screen name="ScanQRCode" component={ScanQRCodeScreen} />
        <Stack.Screen name="CameraScanner" component={CameraScannerScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
