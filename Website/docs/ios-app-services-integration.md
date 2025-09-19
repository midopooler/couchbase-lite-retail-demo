# iOS App Services Integration

## Replace P2P with App Services

### 1. Update DatabaseManager.swift

```swift
import CouchbaseLiteSwift

class DatabaseManager: ObservableObject {
    var database: Database?
    private var replicator: Replicator?
    private let databaseName = "LiquorInventoryDB"
    
    // App Services Configuration
    private let syncGatewayURL = "wss://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB"
    private let username = "liquor_user"
    private let password = "password123"
    
    init() {
        openDatabase()
        setupAppServicesSync()
    }
    
    private func setupAppServicesSync() {
        guard let database = database,
              let url = URL(string: syncGatewayURL) else {
            print("❌ Failed to setup App Services sync")
            return
        }
        
        // Create replicator configuration
        let target = URLEndpoint(url: url)
        var config = ReplicatorConfiguration(database: database, target: target)
        
        // Configure authentication
        config.authenticator = BasicAuthenticator(username: username, password: password)
        
        // Configure sync type (bidirectional)
        config.replicatorType = .pushAndPull
        
        // Enable continuous sync
        config.continuous = true
        
        // Set channels for data filtering
        config.channels = ["liquor-inventory"]
        
        // Create and start replicator
        replicator = Replicator(config: config)
        
        // Add status change listener
        replicator?.addChangeListener { [weak self] change in
            DispatchQueue.main.async {
                self?.handleReplicatorChange(change)
            }
        }
        
        // Start replication
        replicator?.start()
        print("✅ App Services replication started")
    }
    
    private func handleReplicatorChange(_ change: ReplicatorChange) {
        switch change.status.activity {
        case .connecting:
            print("🔄 Connecting to App Services...")
        case .busy:
            print("📡 Syncing with App Services...")
        case .idle:
            print("✅ App Services sync idle")
        case .stopped:
            print("🛑 App Services sync stopped")
        case .offline:
            print("📴 App Services offline")
        @unknown default:
            print("❓ Unknown sync status")
        }
        
        if let error = change.status.error {
            print("❌ App Services sync error: \(error)")
        }
        
        // Notify UI of changes
        self.objectWillChange.send()
    }
    
    deinit {
        replicator?.stop()
    }
}
```

### 2. Update Info.plist for App Services
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>apps.cloud.couchbase.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

### 3. Remove P2P Components
- Delete `P2PSyncManager.swift`
- Remove P2P related code from `App.swift`
- Update `InventoryView.swift` to show App Services status instead of P2P debug info

### 4. Add App Services Status UI
```swift
struct AppServicesStatusView: View {
    @EnvironmentObject var databaseManager: DatabaseManager
    
    var body: some View {
        HStack {
            Circle()
                .fill(syncStatusColor)
                .frame(width: 8, height: 8)
            
            Text("App Services")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
    
    private var syncStatusColor: Color {
        // Determine color based on sync status
        return .green // Simplified for now
    }
}
```
