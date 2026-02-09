import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Organizational System',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ), // Closed the ThemeData parenthesis
      home: const WelcomeScreen(), // Added the "Front Door" to your app
    ); // Closed the MaterialApp parenthesis
  } // Closed the build method curly bracket
} // Closed the class curly bracket
