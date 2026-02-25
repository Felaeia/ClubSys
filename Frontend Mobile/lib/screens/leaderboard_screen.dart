import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class LeaderboardEntry {
  final int rank;
  final String studentNumber;
  final String name;
  final int points;
  final String house;

  LeaderboardEntry({
    required this.rank,
    required this.studentNumber,
    required this.name,
    required this.points,
    required this.house,
  });
}

class LeaderboardScreen extends StatelessWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy Data: Top 10 Students
    final List<LeaderboardEntry> topTen = [
      LeaderboardEntry(rank: 1, studentNumber: '2022-0001-AZ', name: 'Alice Smith', points: 2450, house: 'Azul'),
      LeaderboardEntry(rank: 2, studentNumber: '2022-0412-RO', name: 'Bob Johnson', points: 2300, house: 'Rojo'),
      LeaderboardEntry(rank: 3, studentNumber: '2022-0115-AZ', name: 'Charlie Day', points: 2100, house: 'Azul'),
      LeaderboardEntry(rank: 4, studentNumber: '2021-0882-VE', name: 'Diana Prince', points: 1950, house: 'Verde'),
      LeaderboardEntry(rank: 5, studentNumber: '2023-1002-AM', name: 'Ethan Hunt', points: 1800, house: 'Amarillo'),
      LeaderboardEntry(rank: 6, studentNumber: '2022-0551-AZ', name: 'Fiona Glen', points: 1750, house: 'Azul'),
      LeaderboardEntry(rank: 7, studentNumber: '2021-0023-RO', name: 'Gabe Newell', points: 1600, house: 'Rojo'),
      LeaderboardEntry(rank: 8, studentNumber: '2022-0994-VE', name: 'Hannah Lee', points: 1550, house: 'Verde'),
      LeaderboardEntry(rank: 9, studentNumber: '2023-0121-AZ', name: 'Ian Wright', points: 1400, house: 'Azul'),
      LeaderboardEntry(rank: 10, studentNumber: '2022-0045-AM', name: 'Jane Doe', points: 1250, house: 'Amarillo'),
    ];

    return Scaffold(
      backgroundColor: Colors.indigo, // Background matches House theme
      appBar: AppBar(
        title: const Text('Overall Leaderboard', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      drawer: const CustomDrawer(currentRoute: '/leaderboard'),
      body: Column(
        children: [
          _buildPodium(topTen.sublist(0, 3)),
          Expanded(
            child: Container(
              margin: const EdgeInsets.only(top: 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                itemCount: topTen.length - 3,
                itemBuilder: (context, index) {
                  return _buildRankTile(topTen[index + 3]);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodium(List<LeaderboardEntry> topThree) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _buildPodiumItem(topThree[1], 100, Colors.grey.shade300, Icons.emoji_events), // 2nd
          _buildPodiumItem(topThree[0], 130, Colors.amber, Icons.workspace_premium),    // 1st
          _buildPodiumItem(topThree[2], 90, Colors.orange.shade300, Icons.military_tech), // 3rd
        ],
      ),
    );
  }

  Widget _buildPodiumItem(LeaderboardEntry entry, double height, Color color, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: color, size: 40),
        const SizedBox(height: 8),
        CircleAvatar(
          radius: height / 3,
          backgroundColor: color,
          child: CircleAvatar(
            radius: (height / 3) - 3,
            backgroundColor: Colors.white,
            child: Text(entry.name[0], style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          entry.studentNumber,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
        ),
        Text(
          '${entry.points} pts',
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildRankTile(LeaderboardEntry entry) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Text(
            '#${entry.rank}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.studentNumber,
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                ),
                Text(entry.house, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          Row(
            children: [
              Text(
                '${entry.points}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(width: 10),
              // Reward Icon for Ranks 4-10
              Icon(Icons.stars, color: Colors.indigo.shade200, size: 20),
            ],
          ),
        ],
      ),
    );
  }
}