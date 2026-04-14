import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class Announcement {
  final String title;
  final String content;
  final DateTime date;
  final String category;
  final bool isCritical;

  Announcement({
    required this.title,
    required this.content,
    required this.date,
    required this.category,
    this.isCritical = false,
  });
}

class AnnouncementScreen extends StatefulWidget {
  const AnnouncementScreen({super.key});

  @override
  State<AnnouncementScreen> createState() => _AnnouncementScreenState();
}

class _AnnouncementScreenState extends State<AnnouncementScreen> {
  String selectedCategory = 'All';

    // Consolidated Dummy Data with unique messages for each category
  final List<Announcement> allAnnouncements = [
    Announcement(
      title: 'No Classes: Typhoon Update',
      content: 'Due to severe weather conditions, classes are suspended at all levels today. Stay safe and dry!',
      date: DateTime.now(),
      category: 'Important',
      isCritical: true,
    ),
    Announcement(
      title: 'Azul House: Weekly Assembly',
      content: 'All members of Azul House, please gather at the quadrangle for our spirit check. Wear your blue house colors!',
      date: DateTime.now().subtract(const Duration(hours: 2)),
      category: 'House',
    ),
    Announcement(
      title: 'Foundation Day Meeting',
      content: 'All student organization presidents must attend the final briefing at the AVR regarding booth layouts.',
      date: DateTime.now().subtract(const Duration(days: 1)),
      category: 'Org',
    ),
    Announcement(
      title: 'Basketball Club Tryouts',
      content: 'Ready to hit the court? Tryouts start this Friday at the Main Gym. Bring your own water bottles and gear.',
      date: DateTime.now().subtract(const Duration(days: 2)),
      category: 'Club',
    ),
    Announcement(
      title: 'Midterm Exam Permits',
      content: 'Final call for exam permits. Make sure to settle your accounts before the exams start next week to avoid delays.',
      date: DateTime.now().subtract(const Duration(days: 3)),
      category: 'School',
    ),
  ];

  // Helper to get category-specific styling (Icons and Colors)
  Map<String, dynamic> _getCategoryStyle(String category) {
    switch (category) {
      case 'Important':
        return {'color': Colors.red, 'icon': Icons.warning_amber_rounded};
      case 'House':
        return {'color': Colors.blue.shade800, 'icon': Icons.house_rounded};
      case 'Org':
        return {'color': Colors.orange.shade700, 'icon': Icons.groups_rounded};
      case 'Club':
        return {'color': Colors.green.shade700, 'icon': Icons.sports_basketball_rounded};
      case 'School':
        return {'color': Colors.indigo, 'icon': Icons.school_rounded};
      default:
        return {'color': Colors.grey, 'icon': Icons.notifications_none_rounded};
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filtering Logic
    List<Announcement> filteredList = allAnnouncements.where((a) {
      if (selectedCategory == 'All') return true;
      return a.category == selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Orgsys app', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
          IconButton(icon: const Icon(Icons.account_circle_outlined), onPressed: () {}),
        ],
      ),
      // Clean drawer implementation calling your shared component
      drawer: const CustomDrawer(currentRoute: '/announcements'),
      body: Column(
        children: [
          // Scrollable Filter Header
          Container(
            height: 60,
            color: Colors.white,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 15),
              children: ['All', 'Important', 'House', 'School', 'Org', 'Club']
                  .map((cat) => _buildFilterChip(cat))
                  .toList(),
            ),
          ),
          // Announcement List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(15),
              itemCount: filteredList.length,
              itemBuilder: (context, index) => _buildAnnouncementCard(filteredList[index]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    bool isSelected = selectedCategory == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (bool selected) => setState(() => selectedCategory = label),
        selectedColor: Colors.blue.withValues(alpha: 0.2),
        checkmarkColor: Colors.blue,
        labelStyle: TextStyle(
          color: isSelected ? Colors.blue : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard(Announcement announcement) {
    final style = _getCategoryStyle(announcement.category);
    final Color categoryColor = style['color'];
    final IconData categoryIcon = style['icon'];

    return Card(
      margin: const EdgeInsets.only(bottom: 15),
      elevation: announcement.isCritical ? 4 : 1,
      clipBehavior: Clip.antiAlias, // Ensures sidebar corners match card corners
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: categoryColor.withValues(alpha: 0.3),
          width: 0.5,
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Colored Sidebar - Matches the visual style for different categories
            Container(
              width: 6,
              decoration: BoxDecoration(
                color: categoryColor,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Category Icon + Label + Date
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(categoryIcon, size: 16, color: categoryColor),
                            const SizedBox(width: 6),
                            Text(
                              announcement.category.toUpperCase(),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: categoryColor,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          "${announcement.date.month}/${announcement.date.day}",
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    // Title
                    Text(
                      announcement.title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: announcement.isCritical ? Colors.red : Colors.indigo.shade900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Content
                    Text(
                      announcement.content,
                      style: const TextStyle(color: Colors.black87, height: 1.4),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}      