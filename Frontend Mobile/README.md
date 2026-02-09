Markdown
# ClubSys - Project Management System

A multi-platform application featuring a **Flutter** frontend, a **C#** backend service, and **Firebase** for real-time data and authentication.

---

## 🏗️ Project Architecture
* **Frontend:** Flutter (Mobile & Web)
* **Backend:** C# (.NET Web API)
* **Database/Auth:** Firebase (Firestore & Firebase Authentication)

---

## 🚀 Getting Started (Frontend)

### 1. Prerequisites
* [Flutter SDK](https://docs.flutter.dev/get-started/install) (Latest Stable)
* [Dart SDK](https://dart.dev/get-started/sdk)
* C# / .NET SDK (if running the backend locally)

### 2. Installation
```bash
# Clone the repository
git clone git@github.com:Felaeia/ClubSys.git

# Enter the directory
cd ClubSys

# Install Flutter dependencies
flutter pub get
3. Firebase Setup
To get the app running, you need the configuration files from the backend lead:

Android: android/app/google-services.json

iOS: ios/Runner/GoogleService-Info.plist

4. Running the App
Bash
flutter run
📁 Project Structure
lib/ - Main Flutter application logic.

models/ - Dart classes matching C# API responses.

screens/ - UI pages and layouts.

services/ - Logic for Firebase and C# API calls.

android/ios/windows/ - Platform-specific configurations.

FrontendDocumentation.md - Specific UI/UX design notes.

🤝 Team Workflow
Frontend Lead: Kent Kay Otadoy

Backend Lead: Manuel Cando

Branching Strategy
main: Production-ready code.

frontend-dev: Current UI development and Flutter features.

backend-dev: C# API and Firebase logic updates.

API Integration
When connecting to the C# local server from a mobile emulator:

Android Emulator: Use http://10.0.2.2:PORT

iOS Simulator: Use http://localhost:PORT

© 2026 ClubSys Development Team