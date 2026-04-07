import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              // Handle edit profile
            },
          ),
        ],
      ),
      drawer: const CustomDrawer(currentRoute: '/profile'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildProfileHeader(),
            const SizedBox(height: 20),
            _buildSectionTitle('Account Information'),
            _buildInfoCard([
              _buildInfoTile(Icons.email_outlined, 'Email', 'student.azul@airline1.edu'),
              _buildInfoTile(Icons.phone_android_outlined, 'Student ID', '2024-00123-MN-0'),
              _buildInfoTile(Icons.school_outlined, 'Course', 'BS in Computer Science'),
              _buildInfoTile(Icons.calendar_month_outlined, 'Year Level', '3rd Year'),
            ]),
            const SizedBox(height: 10),
            _buildSectionTitle('Organizations'),
            _buildInfoCard([
              _buildInfoTile(Icons.house_outlined, 'House', 'Azul House', trailing: 'Member'),
              _buildInfoTile(Icons.sports_basketball_rounded, 'Clubs', 'Varsity Basketball', trailing: 'Captain'),
              _buildInfoTile(Icons.code_rounded, 'Clubs', 'Google Developer Student Club', trailing: 'Member'),
            ]),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.indigo,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 40),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 55,
            backgroundColor: Colors.white,
            child: CircleAvatar(
              radius: 50,
              backgroundImage: NetworkImage('https://i.pravatar.cc/300?img=12'), // Dummy Avatar
            ),
          ),
          const SizedBox(height: 15),
          const Text(
            'Juan Dela Cruz',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 5),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.blue.shade800,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white30),
            ),
            child: const Text(
              'AZUL HOUSE',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.indigo.shade900,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value, {String? trailing}) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.indigo.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Colors.indigo, size: 20),
      ),
      title: Text(
        label,
        style: const TextStyle(fontSize: 12, color: Colors.grey),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
      ),
      trailing: trailing != null
          ? Text(
              trailing,
              style: const TextStyle(
                color: Colors.blue,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            )
          : null,
    );
  }
}