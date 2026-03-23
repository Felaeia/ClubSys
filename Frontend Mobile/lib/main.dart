import 'package:flutter/material.dart';

// Import all your screen files
import 'screens/welcome_screen.dart';
import 'screens/announcement_screen.dart';
import 'screens/merit_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/shop_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/qr_scanner_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Orgsys',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      // 1. Set the initial route to the Welcome Screen
      initialRoute: '/',
      
      // 2. Define the "Map" of routes for the entire app
      routes: {
        '/': (context) => const WelcomeScreen(),
        '/announcements': (context) => const AnnouncementScreen(),
        '/merits': (context) => const MeritScreen(),
        '/leaderboard': (context) => const LeaderboardScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/shop': (context) => const ShopScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/qr_scanner': (context) => const QrScannerScreen(),
        '/login': (context) => const WelcomeScreen(), // Redirect logout back to start
      },
    );
  }
}