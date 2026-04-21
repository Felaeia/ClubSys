import 'package:flutter/material.dart';

class CustomDrawer extends StatelessWidget {
  final String currentRoute;

  const CustomDrawer({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          // Header Section
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
              left: 16,
              right: 16,
              bottom: 24,
            ),
            decoration: const BoxDecoration(
              color: Colors.indigo,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(height: 30),
                const Text(
                  'ClubSys App',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  'Member Portal',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          
          // Navigation Items
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildItem(context, Icons.home_outlined, 'Home', '/announcements'),
                _buildItem(context, Icons.qr_code_scanner, 'Scan QR', '/qr_scanner'),
                _buildItem(context, Icons.star_outline, 'Merits', '/merits'),
                _buildItem(context, Icons.emoji_events_outlined, 'Leader Board', '/leaderboard'),
                _buildItem(context, Icons.receipt_long_outlined, 'Transactions', '/transactions'),
                _buildItem(context, Icons.person_outline, 'Profile', '/profile'),
                _buildItem(context, Icons.shopping_bag_outlined, 'Shop', '/shop'),
                _buildItem(context, Icons.settings_outlined, 'Settings', '/settings'),
              ],
            ),
          ),
          
          const Divider(),
          _buildItem(context, Icons.logout, 'Logout', '/login', color: Colors.redAccent),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildItem(BuildContext context, IconData icon, String title, String route, {Color? color}) {
    bool isSelected = currentRoute == route;
    return ListTile(
      leading: Icon(icon, color: isSelected ? Colors.indigo : (color ?? Colors.black54)),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.indigo : (color ?? Colors.black87),
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      // Using .withValues to stay up to date with Flutter standards
      tileColor: isSelected ? Colors.indigo.withValues(alpha: 0.1) : null,
      onTap: () {
        Navigator.pop(context); 
        if (!isSelected) {
          Navigator.pushReplacementNamed(context, route);
        }
      },
    );
  }
}