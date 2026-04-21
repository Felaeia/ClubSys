import 'package:flutter/material.dart';

class TransactionScreen extends StatelessWidget {
  const TransactionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Activity History", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Column(
        children: [
          // Total Balance Header
          _buildBalanceHeader(),
          const Divider(height: 1),
          // Scrollable List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 10),
              children: [
                _buildTransactionTile(
                  title: "IT Olympics Attendance",
                  subtitle: "Event: ACLC Week",
                  date: "March 15, 2026",
                  amount: "+50 XP",
                  isPositive: true,
                  icon: Icons.qr_code,
                ),
                _buildTransactionTile(
                  title: "WADT Representative Award",
                  subtitle: "Merit: Leadership Excellence",
                  date: "March 12, 2026",
                  amount: "+1 Merit",
                  isPositive: true,
                  icon: Icons.military_tech,
                ),
                _buildTransactionTile(
                  title: "CSO Tech T-Shirt",
                  subtitle: "Shop Purchase",
                  date: "March 10, 2026",
                  amount: "-200 XP",
                  isPositive: false,
                  icon: Icons.shopping_bag,
                ),
                _buildTransactionTile(
                  title: "Monthly Meeting",
                  subtitle: "Regular Attendance",
                  date: "March 01, 2026",
                  amount: "+20 XP",
                  isPositive: true,
                  icon: Icons.groups,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      width: double.infinity,
      child: Column(
        children: [
          const Text("TOTAL EARNED", style: TextStyle(color: Colors.grey, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          const Text(
            "1,250 XP",
            style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.indigo),
          ),
          const SizedBox(height: 4),
          Text(
            "Rank: Gold Member",
            style: TextStyle(color: Colors.amber[800], fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionTile({
    required String title,
    required String subtitle,
    required String date,
    required String amount,
    required bool isPositive,
    required IconData icon,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isPositive ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: isPositive ? Colors.green : Colors.red, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text("$subtitle • $date", style: const TextStyle(fontSize: 12)),
      trailing: Text(
        amount,
        style: TextStyle(
          color: isPositive ? Colors.green : Colors.red,
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
    );
  }
}