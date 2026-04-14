import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _pushNotifications = true;
  bool _darkMode = false;
  bool _emailUpdates = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      drawer: const CustomDrawer(currentRoute: '/settings'),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        children: [
          _buildSectionHeader('Preferences'),
          _buildToggleTile(
            Icons.notifications_active_outlined, 
            'Push Notifications', 
            'Get alerts for new announcements', 
            _pushNotifications, 
            (val) => setState(() => _pushNotifications = val),
          ),
          _buildToggleTile(
            Icons.dark_mode_outlined, 
            'Dark Mode', 
            'Adjust app appearance', 
            _darkMode, 
            (val) => setState(() => _darkMode = val),
          ),
          _buildToggleTile(
            Icons.alternate_email_rounded, 
            'Email Updates', 
            'Receive monthly merit summaries', 
            _emailUpdates, 
            (val) => setState(() => _emailUpdates = val),
          ),
          
          const SizedBox(height: 20),
          _buildSectionHeader('Account & Security'),
          _buildSimpleTile(Icons.lock_outline, 'Change Password', 'Update your login credentials'),
          _buildSimpleTile(Icons.verified_user_outlined, 'Two-Factor Authentication', 'Enhance your account security'),
          
          const SizedBox(height: 20),
          _buildSectionHeader('Support'),
          _buildSimpleTile(Icons.help_outline, 'Help Center', 'FAQs and troubleshooting'),
          _buildSimpleTile(Icons.description_outlined, 'Privacy Policy', 'Data usage and terms'),
          
          const SizedBox(height: 40),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: OutlinedButton.icon(
              onPressed: () {
                // Log out logic
                Navigator.pushReplacementNamed(context, '/login');
              },
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Log Out', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Center(
            child: Text(
              'ClubSys App v1.0.4 - Azul House Edition',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: Colors.indigo,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildToggleTile(IconData icon, String title, String subtitle, bool value, Function(bool) onChanged) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SwitchListTile(
        secondary: Icon(icon, color: Colors.indigo),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        value: value,
        activeColor: Colors.indigo,
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildSimpleTile(IconData icon, String title, String subtitle) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: Colors.indigo),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, size: 20),
        onTap: () {
          // Navigate to specific sub-setting
        },
      ),
    );
  }
}