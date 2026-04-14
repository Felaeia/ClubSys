import 'package:flutter/material.dart';
import '../common/custom_drawer.dart';

class ShopItem {
  final String title;
  final String cost;
  final String provider;
  final IconData icon;
  final Color color;
  final String category;

  ShopItem({
    required this.title,
    required this.cost,
    required this.provider,
    required this.icon,
    required this.color,
    required this.category,
  });
}

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String selectedCategory = 'All';

  final List<ShopItem> inventory = [
    // ACADEMIC PERKS
    ShopItem(
      title: '24h Project Extension',
      cost: '20',
      provider: 'Academic Affairs',
      icon: Icons.timer_outlined,
      color: Colors.redAccent,
      category: 'Academic',
    ),
    // MERCHANDISE
    ShopItem(
      title: 'Official Org Keychain',
      cost: '10',
      provider: 'Student Council Store',
      icon: Icons.vpn_key_outlined,
      color: Colors.orange,
      category: 'Merch',
    ),
    ShopItem(
      title: 'Azul House Lanyard',
      cost: '15',
      provider: 'House Committee',
      icon: Icons.badge_outlined,
      color: Colors.blue.shade800,
      category: 'Merch',
    ),
    // FOOD PARTNERS
    ShopItem(
      title: '1 Hot Siopao',
      cost: '1',
      provider: 'Mang Juan Store',
      icon: Icons.fastfood_outlined,
      color: Colors.brown,
      category: 'Partners',
    ),
    ShopItem(
      title: 'Iced Coffee Voucher',
      cost: '8',
      provider: 'Campus Brew',
      icon: Icons.coffee_outlined,
      color: Colors.teal,
      category: 'Partners',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    List<ShopItem> filteredItems = inventory.where((item) {
      if (selectedCategory == 'All') return true;
      return item.category == selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Rewards Shop', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      drawer: const CustomDrawer(currentRoute: '/shop'),
      body: Column(
        children: [
          _buildPointsWallet(),
          _buildCategoryFilter(),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(15),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.8,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: filteredItems.length,
              itemBuilder: (context, index) => _buildShopCard(filteredItems[index]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPointsWallet() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 25),
      color: Colors.indigo,
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 12)),
                Text('1,250 pts', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              ],
            ),
            Icon(Icons.account_balance_wallet_outlined, color: Colors.amber.shade400, size: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    final categories = ['All', 'Academic', 'Merch', 'Partners'];
    return Container(
      height: 60,
      color: Colors.white,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        children: categories.map((cat) {
          bool isSelected = selectedCategory == cat;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 5),
            child: ChoiceChip(
              label: Text(cat),
              selected: isSelected,
              onSelected: (val) => setState(() => selectedCategory = cat),
              selectedColor: Colors.indigo.shade100,
              labelStyle: TextStyle(color: isSelected ? Colors.indigo : Colors.black54),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildShopCard(ShopItem item) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Icon(item.icon, color: item.color, size: 30),
            ),
            const Spacer(),
            Text(
              item.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              item.provider,
              style: const TextStyle(color: Colors.grey, fontSize: 11),
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${item.cost} pts',
                  style: TextStyle(color: Colors.indigo.shade900, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () {
                    // Claim logic
                  },
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: const Size(40, 30),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Redeem', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}