import 'package:flutter/material.dart';

class CustomDrawer extends StatelessWidget {
  final String currentRoute;

  const CustomDrawer({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Colors.indigo),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ClubSys App',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.settings, color: Colors.white),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushReplacementNamed(context, '/settings');
                  },
                )
              ],
            ),
          ),
          _buildItem(context, Icons.home_outlined, 'Home', '/announcements'),
          _buildItem(context, Icons.qr_code_scanner, 'Scan QR', '/qr_scanner'),
          _buildItem(context, Icons.star_outline, 'Merits', '/merits'),
          _buildItem(context, Icons.emoji_events_outlined, 'Leader Board', '/leaderboard'),
          _buildItem(context, Icons.person_outline, 'Profile', '/profile'),
          _buildItem(context, Icons.shopping_bag_outlined, 'Shop', '/shop'),
          _buildItem(context, Icons.settings_outlined, 'Settings', '/settings'),
          const Spacer(),
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