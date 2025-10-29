# FairWayLanka

FairWayLanka is a modern digital bus ticketing solution for Sri Lanka, designed to streamline public transport payments through QR codes and real-time wallet management. The platform provides a secure, cashless, and efficient way for passengers, conductors, and bus owners to manage fares, trips, and financial transactions.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Smart QR Code Ticketing:** Each passenger generates a QR code linked to their bank account/wallet, used for payment and authentication.
- **Bus Conductor Scanning:** Conductors scan passenger QR codes to deduct fare instantly and log the trip.
- **Digital Wallet:** Passengers can add money to their wallet, check balances, and view trip history.
- **Trip Summary:** Provides daily and monthly summaries of trips, sales, and collected amounts.
- **Owner Dashboard:** Bus owners view today’s revenue, passenger count, manage conductors, buses, and banking details.
- **Banking Integration:** Owners can transfer wallet funds to their bank accounts.
- **Real-Time Data:** Utilizes Firebase for real-time updates to ticketing, wallet, and revenue.
- **Mobile-First UI:** Built with React Native for seamless experience on mobile devices.

## Technologies Used

- **Frontend:** React Native (JavaScript)
- **Backend/Database:** Firebase (Firestore, Auth)
- **State Management:** React Hooks, Context API
- **Other Libraries:** @react-native-async-storage/async-storage, @react-native-picker/picker, Expo, React Navigation

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shenal2001/FairWayLanka.git
   cd FairWayLanka
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `authScreen/firebase.js` with your Firebase credentials if deploying your own instance.

4. **Run the app**
   ```bash
   npx expo start
   ```

## Usage

- Passengers register, add money to their wallet, and generate a QR code for bus travel.
- Conductors scan QR codes, deduct fares, and generate tickets directly from their app.
- Owners and managers use dashboards to monitor buses, revenue, and manage staff.
- All actions update in real time and can be accessed from any mobile device.

## Project Structure


FairWayLanka/
│
├── authScreen/          # Authentication screens, dashboards, passenger and owner flows
│   ├── firebase.js      # Firebase integration
│   ├── dashboard.js     # Main dashboard UI
│   └── passenger/       # Passenger-specific screens (Home, Summary, AddMoney, etc.)
│   └── Owner/           # Owner-specific screens (Banking, BusOwnerMain, etc.)
├── screens/             # Ticket scanning, ticket details, confirmation screens
├── assets/              # App images and logos
├── components/          # Shared React Native components
└── README.md            # This file


## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m 'Add new feature).
4. Push to your branch (git push origin feature/your-feature).
5. Open a [pull request](https://github.com/shenal2001/FairWayLanka/pulls).

## License

This project is currently unlicensed. Please contact the author for permission before commercial use.

## Contact

- **Author:** [shenal2001](https://github.com/shenal2001)

For issues, suggestions, or support, please open a GitHub issue or reach out via the author's profile or email [email me](mailto:rashmikashenal225@gmail.com).

---
**FairWayLanka** – Sri Lanka’s Smart Bus Payment System
