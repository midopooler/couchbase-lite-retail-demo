# Hybrid Sync UI Design

## 📱 iOS UI Integration

### Add to InventoryView.swift
```swift
struct InventoryView: View {
    @EnvironmentObject var databaseManager: DatabaseManager
    @StateObject private var syncManager = HybridSyncManager()
    
    var body: some View {
        NavigationView {
            VStack {
                // Sync Mode Selector at top
                SyncModeSelector(syncManager: syncManager)
                    .padding(.horizontal)
                
                // Existing inventory grid
                // ... your existing inventory code
            }
            .navigationTitle("Inventory")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    SyncStatusIndicator(syncManager: syncManager)
                }
            }
        }
    }
}

struct SyncStatusIndicator: View {
    @ObservedObject var syncManager: HybridSyncManager
    
    var body: some View {
        HStack {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
            
            Image(systemName: syncManager.currentSyncMode.icon)
                .font(.caption)
        }
    }
    
    private var statusColor: Color {
        switch syncManager.currentSyncMode {
        case .p2p: return syncManager.isP2PAvailable ? .green : .orange
        case .appServices: return syncManager.isAppServicesAvailable ? .blue : .orange
        case .offline: return .gray
        }
    }
}
```

## 🤖 Android UI Integration

### Add to MainActivity.kt
```kotlin
@Composable
fun LiquorInventoryApp(syncManager: HybridSyncManager) {
    Column {
        // Sync Mode Selector at top
        SyncModeSelector(syncManager = syncManager)
        
        // Existing inventory content
        InventoryContent()
    }
}

@Composable
fun TopAppBarWithSync(syncManager: HybridSyncManager) {
    val syncStatus by syncManager.syncStatus.collectAsState()
    val currentMode by syncManager.currentSyncMode.collectAsState()
    
    TopAppBar(
        title = { Text("Liquor Inventory") },
        actions = {
            // Sync status indicator
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(end = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(
                            color = when (currentMode) {
                                SyncMode.P2P -> Color.Green
                                SyncMode.APP_SERVICES -> Color.Blue
                                SyncMode.OFFLINE -> Color.Gray
                            },
                            shape = CircleShape
                        )
                )
                
                Spacer(modifier = Modifier.width(4.dp))
                
                Icon(
                    painter = painterResource(
                        id = when (currentMode.icon) {
                            "network" -> R.drawable.ic_network
                            "cloud" -> R.drawable.ic_cloud
                            else -> R.drawable.ic_wifi_off
                        }
                    ),
                    contentDescription = currentMode.displayName,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    )
}
```

## 🎨 Visual Design Mockup

```
┌─────────────────────────────────────────┐
│                Inventory                │
│                                    🔗 ● │ <- Status indicator
├─────────────────────────────────────────┤
│           Sync Mode                     │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │   P2P   │ │  Cloud  │ │ Offline │    │ <- Toggle buttons
│  │ (🔗 ●)  │ │ (☁️ ●)  │ │ (📴 ●)  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│  Status: ☁️ Cloud sync ready            │ <- Current status
├─────────────────────────────────────────┤
│                                         │
│  [Search Bar]                           │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Whiskey │ │  Vodka  │ │   Rum   │    │ <- Inventory grid
│  │   $45   │ │   $55   │ │   $23   │    │
│  │  [+ -]  │ │  [+ -]  │ │  [+ -]  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 User Experience Flow

### Automatic Mode Selection
```swift
// Smart mode selection based on availability
func recommendSyncMode() -> SyncMode {
    if isAppServicesAvailable && !isP2PAvailable {
        return .appServices  // Only cloud available
    } else if isP2PAvailable && !isAppServicesAvailable {
        return .p2p         // Only P2P available
    } else if isP2PAvailable && isAppServicesAvailable {
        return .appServices  // Prefer cloud when both available
    } else {
        return .offline     // Nothing available
    }
}
```

### Status Messages
```
P2P Mode:
- "🔗 Searching for peers..."
- "🔗 Connected to 2 devices"
- "🔗 P2P sync active"

App Services Mode:
- "☁️ Connecting to cloud..."
- "☁️ Syncing with cloud..."
- "☁️ Cloud sync ready"

Offline Mode:
- "📴 Working offline"
- "📴 Changes saved locally"
```

## 🔄 Settings Integration

### iOS Settings View
```swift
struct SyncSettingsView: View {
    @ObservedObject var syncManager: HybridSyncManager
    
    var body: some View {
        Form {
            Section("Sync Preferences") {
                Toggle("Auto-switch to cloud when available", isOn: $autoSwitchToCloud)
                Toggle("Prefer P2P on local network", isOn: $preferP2P)
                Toggle("Sync in background", isOn: $backgroundSync)
            }
            
            Section("Advanced") {
                HStack {
                    Text("App Services URL")
                    Spacer()
                    Text(syncManager.appServicesURL)
                        .foregroundColor(.gray)
                }
                
                Button("Test Connectivity") {
                    syncManager.testConnectivity()
                }
            }
        }
        .navigationTitle("Sync Settings")
    }
}
```

### Android Settings Fragment
```kotlin
@Composable
fun SyncSettingsScreen(syncManager: HybridSyncManager) {
    LazyColumn {
        item {
            PreferenceGroup(title = "Sync Preferences") {
                SwitchPreference(
                    title = "Auto-switch to cloud when available",
                    checked = autoSwitchToCloud,
                    onCheckedChange = { autoSwitchToCloud = it }
                )
                
                SwitchPreference(
                    title = "Prefer P2P on local network",
                    checked = preferP2P,
                    onCheckedChange = { preferP2P = it }
                )
            }
        }
        
        item {
            PreferenceGroup(title = "Advanced") {
                TextPreference(
                    title = "App Services URL",
                    summary = syncManager.appServicesUrl
                )
                
                ButtonPreference(
                    title = "Test Connectivity",
                    onClick = { syncManager.testConnectivity() }
                )
            }
        }
    }
}
```

## 🎨 Theme Integration

### iOS Theme Colors
```swift
extension Color {
    static let p2pColor = Color.green
    static let appServicesColor = Color.blue
    static let offlineColor = Color.gray
    static let syncActiveColor = Color.orange
}
```

### Android Theme Colors
```kotlin
val P2PColor = Color(0xFF4CAF50)      // Green
val AppServicesColor = Color(0xFF2196F3)  // Blue  
val OfflineColor = Color(0xFF9E9E9E)      // Gray
val SyncActiveColor = Color(0xFFFF9800)   // Orange
```
