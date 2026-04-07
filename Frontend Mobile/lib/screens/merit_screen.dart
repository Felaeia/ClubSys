import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class MeritQuest {
  final String title;
  final String description;
  final int points;
  final IconData icon;
  final Color color;

  MeritQuest({
    required this.title,
    required this.description,
    required this.points,
    required this.icon,
    required this.color,
  });
}

class MeritScreen extends StatelessWidget {
  const MeritScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy Data for Quests
    final List<MeritQuest> quests = [
      MeritQuest(
        title: 'Join a Club Today',
        description: 'Register for any recognized student organization.',
        points: 5,
        icon: Icons.groups_outlined,
        color: Colors.orange,
      ),
      MeritQuest(
        title: 'Attend House Assembly',
        description: 'Check-in at the quadrangle for the Azul House meet.',
        points: 10,
        icon: Icons.house_outlined,
        color: Colors.blue.shade800,
      ),
      MeritQuest(
        title: 'Volunteer: Campus Cleanup',
        description: 'Help the environment committee for 1 hour.',
        points: 20,
        icon: Icons.cleaning_services_outlined,
        color: Colors.green,
      ),
      MeritQuest(
        title: 'Perfect Attendance Week',
        description: 'Attend all your scheduled classes this week.',
        points: 15,
        // FIXED: Using event_available to avoid red underline error
        icon: Icons.event_available, 
        color: Colors.indigo,
      ),
      MeritQuest(
        title: 'Library Study Session',
        description: 'Log 2 hours of focused study in the school library.',
        points: 5,
        icon: Icons.menu_book_rounded,
        color: Colors.purple,
      ),
    ];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('My Merits', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      drawer: const CustomDrawer(currentRoute: '/merits'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // TOP STATS SECTION (Ranking & Overall Points)
            _buildHeaderStats(),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              child: Row(
                children: [
                  Icon(Icons.bolt, color: Colors.amber),
                  SizedBox(width: 8),
                  Text(
                    'Available Quests',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),

            // QUESTS LIST
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 15),
              itemCount: quests.length,
              itemBuilder: (context, index) => _buildQuestCard(quests[index]),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderStats() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(25),
      decoration: const BoxDecoration(
        color: Colors.indigo,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          const Text(
            'Azul House Pride',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatItem('1,250', 'Total Points', Icons.stars),
              Container(width: 1, height: 40, color: Colors.white24),
              _buildStatItem('#04', 'Leaderboard Rank', Icons.emoji_events),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.amber, size: 28),
        const SizedBox(height: 5),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white, 
            fontSize: 24, 
            fontWeight: FontWeight.bold
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white60, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildQuestCard(MeritQuest quest) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        leading: CircleAvatar(
          backgroundColor: quest.color.withValues(alpha: 0.1),
          child: Icon(quest.icon, color: quest.color),
        ),
        title: Text(
          quest.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(quest.description),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.amber.shade100,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '+${quest.points} pts',
            style: TextStyle(
              color: Colors.amber.shade900,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}