import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../common/custom_drawer.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController scannerController = MobileScannerController();
  final TextEditingController _pointController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('ClubSys Merits'),
          backgroundColor: Colors.indigo,
          foregroundColor: Colors.white,
          bottom: const TabBar(
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(icon: Icon(Icons.qr_code), text: "My ID"),
              Tab(icon: Icon(Icons.send), text: "Give Points"),
            ],
          ),
        ),
        drawer: const CustomDrawer(currentRoute: '/qr_scanner'),
        body: TabBarView(
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _buildMyCodeView("STUDENT_ID_99"),
            _buildScannerView(),
          ],
        ),
      ),
    );
  }

  Widget _buildMyCodeView(String data) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text("My QR ID", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          QrImageView(
            data: data,
            version: QrVersions.auto,
            size: 250.0,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.indigo),
          ),
          const SizedBox(height: 16),
          const Text("Others scan this to give you points", style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildScannerView() {
    return Stack(
      children: [
        // 1. The Camera Feed
        MobileScanner(
          controller: scannerController,
          onDetect: (capture) {
            final List<Barcode> barcodes = capture.barcodes;
            if (barcodes.isNotEmpty) {
              final String recipientId = barcodes.first.rawValue ?? "Unknown";
              _handlePointTransfer(recipientId);
            }
          },
        ),

        // 2. The Modern Overlay (Darkened background with a clear square)
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.5),
            BlendMode.srcOut,
          ),
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.black,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Align(
                alignment: Alignment.center,
                child: Container(
                  height: 260,
                  width: 260,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ],
          ),
        ),

        // 3. The Indigo Border "Focus" Box
        Align(
          alignment: Alignment.center,
          child: Container(
            height: 260,
            width: 260,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.indigo, width: 4),
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),

        // 4. Instructional Text
        const Align(
          alignment: Alignment.bottomCenter,
          child: Padding(
            padding: EdgeInsets.only(bottom: 100),
            child: Text(
              "Align QR Code inside the square",
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
                backgroundColor: Colors.black26,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _handlePointTransfer(String recipientId) {
    scannerController.stop();
    _pointController.clear();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 20, right: 20, top: 20
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.stars, color: Colors.amber, size: 50),
            const SizedBox(height: 10),
            Text("Send Points to: $recipientId", 
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 20),
            TextField(
              controller: _pointController,
              keyboardType: TextInputType.number,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: "Amount of Points",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.add_moderator),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Cancel"),
                  ),
                ),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () {
                      String amount = _pointController.text;
                      Navigator.pop(context);
                      _showSuccessMessage(recipientId, amount);
                    },
                    child: const Text("Confirm"),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    ).whenComplete(() => scannerController.start());
  }

  void _showSuccessMessage(String id, String amount) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Successfully sent $amount points to $id!"),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  void dispose() {
    scannerController.dispose();
    _pointController.dispose();
    super.dispose();
  }
}