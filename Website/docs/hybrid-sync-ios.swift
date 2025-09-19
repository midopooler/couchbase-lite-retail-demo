// iOS Hybrid Sync Implementation
// File: HybridSyncManager.swift

import CouchbaseLiteSwift
import Network
import Foundation

enum SyncMode: String, CaseIterable {
    case p2p = "P2P"
    case appServices = "App Services"
    case offline = "Offline"
    
    var icon: String {
        switch self {
        case .p2p: return "network"
        case .appServices: return "cloud"
        case .offline: return "wifi.slash"
        }
    }
}

class HybridSyncManager: ObservableObject {
    @Published var currentSyncMode: SyncMode = .offline
    @Published var isP2PAvailable: Bool = false
    @Published var isAppServicesAvailable: Bool = false
    @Published var syncStatus: String = "Offline"
    
    // Core components
    private var database: Database?
    private var currentReplicator: Replicator?
    
    // P2P Components (existing)
    private var p2pListener: URLEndpointListener?
    private var p2pBrowser: NWBrowser?
    
    // App Services Components (new)
    private let appServicesURL = "wss://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB"
    private let appServicesUsername = "liquor_user"
    private let appServicesPassword = "password123"
    
    init(database: Database) {
        self.database = database
        setupNetworkMonitoring()
        checkAvailability()
    }
    
    // MARK: - Public Interface
    
    func setSyncMode(_ mode: SyncMode) {
        print("🔄 Switching sync mode from \(currentSyncMode) to \(mode)")
        
        // Stop current sync
        stopCurrentSync()
        
        // Start new sync mode
        switch mode {
        case .p2p:
            if isP2PAvailable {
                startP2PSync()
                currentSyncMode = .p2p
            } else {
                print("❌ P2P not available")
                syncStatus = "P2P not available"
            }
            
        case .appServices:
            if isAppServicesAvailable {
                startAppServicesSync()
                currentSyncMode = .appServices
            } else {
                print("❌ App Services not available")
                syncStatus = "App Services not available"
            }
            
        case .offline:
            currentSyncMode = .offline
            syncStatus = "Offline mode"
        }
    }
    
    // MARK: - Availability Checking
    
    private func checkAvailability() {
        // Check P2P availability (local network)
        checkP2PAvailability()
        
        // Check App Services availability (internet)
        checkAppServicesAvailability()
    }
    
    private func checkP2PAvailability() {
        // Use existing P2P discovery logic
        let monitor = NWPathMonitor(requiredInterfaceType: .wifi)
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isP2PAvailable = path.status == .satisfied
                print("📡 P2P Available: \(self?.isP2PAvailable ?? false)")
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
    
    private func checkAppServicesAvailability() {
        // Simple connectivity check to App Services
        guard let url = URL(string: appServicesURL.replacingOccurrences(of: "wss://", with: "https://")) else { return }
        
        let task = URLSession.shared.dataTask(with: url) { [weak self] _, response, error in
            DispatchQueue.main.async {
                if let httpResponse = response as? HTTPURLResponse, 
                   httpResponse.statusCode < 500 {
                    self?.isAppServicesAvailable = true
                    print("☁️ App Services Available: true")
                } else {
                    self?.isAppServicesAvailable = false
                    print("☁️ App Services Available: false")
                }
            }
        }
        task.resume()
    }
    
    // MARK: - P2P Sync (Enhanced existing logic)
    
    private func startP2PSync() {
        guard let database = database else { return }
        
        print("🔗 Starting P2P sync...")
        syncStatus = "Starting P2P sync..."
        
        // Use existing P2P logic but wrapped in the new manager
        startP2PListener()
        startP2PDiscovery()
        
        // Set up P2P replicator (using existing URLEndpointListener logic)
        // This integrates your existing P2PSyncManager code
        syncStatus = "P2P sync active"
    }
    
    private func startP2PListener() {
        // Existing P2P listener logic from P2PSyncManager
        // Just integrate it here instead of separate class
    }
    
    private func startP2PDiscovery() {
        // Existing P2P discovery logic from P2PSyncManager
        // Just integrate it here instead of separate class
    }
    
    // MARK: - App Services Sync (New)
    
    private func startAppServicesSync() {
        guard let database = database else { return }
        
        print("☁️ Starting App Services sync...")
        syncStatus = "Connecting to App Services..."
        
        do {
            // Create App Services endpoint
            guard let url = URL(string: appServicesURL) else {
                throw NSError(domain: "Invalid URL", code: -1)
            }
            
            let target = URLEndpoint(url: url)
            var config = ReplicatorConfiguration(database: database, target: target)
            
            // Configure authentication
            config.authenticator = BasicAuthenticator(
                username: appServicesUsername,
                password: appServicesPassword
            )
            
            // Configure sync
            config.replicatorType = .pushAndPull
            config.continuous = true
            config.channels = ["liquor-inventory"]
            
            // Create and start replicator
            currentReplicator = Replicator(config: config)
            
            currentReplicator?.addChangeListener { [weak self] change in
                DispatchQueue.main.async {
                    self?.handleAppServicesChange(change)
                }
            }
            
            currentReplicator?.start()
            print("✅ App Services sync started")
            
        } catch {
            print("❌ Failed to start App Services sync: \(error)")
            syncStatus = "App Services connection failed"
        }
    }
    
    private func handleAppServicesChange(_ change: ReplicatorChange) {
        switch change.status.activity {
        case .connecting:
            syncStatus = "☁️ Connecting to cloud..."
        case .busy:
            syncStatus = "☁️ Syncing with cloud..."
        case .idle:
            syncStatus = "☁️ Cloud sync ready"
        case .stopped:
            syncStatus = "☁️ Cloud sync stopped"
        case .offline:
            syncStatus = "☁️ Cloud offline"
        @unknown default:
            syncStatus = "☁️ Cloud sync unknown"
        }
        
        if let error = change.status.error {
            print("❌ App Services error: \(error)")
            syncStatus = "☁️ Cloud sync error"
        }
    }
    
    // MARK: - Sync Management
    
    private func stopCurrentSync() {
        print("🛑 Stopping current sync...")
        
        // Stop any active replicator
        currentReplicator?.stop()
        currentReplicator = nil
        
        // Stop P2P components
        p2pListener?.stop()
        p2pBrowser?.cancel()
        
        syncStatus = "Sync stopped"
    }
    
    private func setupNetworkMonitoring() {
        // Monitor network changes and update availability
        let monitor = NWPathMonitor()
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                if path.status == .satisfied {
                    self?.checkAvailability()
                } else {
                    self?.isP2PAvailable = false
                    self?.isAppServicesAvailable = false
                }
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
    
    // MARK: - Data Migration
    
    func migrateDataBetweenModes() {
        // Both modes use the same local database
        // No data migration needed, just different sync targets
        print("✅ No data migration needed - same local database")
    }
    
    deinit {
        stopCurrentSync()
    }
}

// MARK: - UI Integration

struct SyncModeSelector: View {
    @ObservedObject var syncManager: HybridSyncManager
    
    var body: some View {
        VStack {
            Text("Sync Mode")
                .font(.headline)
                .padding(.bottom, 8)
            
            // Mode Selection
            Picker("Sync Mode", selection: $syncManager.currentSyncMode) {
                ForEach(SyncMode.allCases, id: \.self) { mode in
                    HStack {
                        Image(systemName: mode.icon)
                        Text(mode.rawValue)
                    }
                    .tag(mode)
                }
            }
            .pickerStyle(SegmentedPickerStyle())
            .onChange(of: syncManager.currentSyncMode) { newMode in
                syncManager.setSyncMode(newMode)
            }
            
            // Availability Indicators
            HStack {
                // P2P Status
                HStack {
                    Circle()
                        .fill(syncManager.isP2PAvailable ? .green : .red)
                        .frame(width: 8, height: 8)
                    Text("P2P")
                        .font(.caption)
                }
                
                Spacer()
                
                // App Services Status
                HStack {
                    Circle()
                        .fill(syncManager.isAppServicesAvailable ? .green : .red)
                        .frame(width: 8, height: 8)
                    Text("Cloud")
                        .font(.caption)
                }
            }
            .padding(.top, 4)
            
            // Current Status
            Text(syncManager.syncStatus)
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.top, 4)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Integration with DatabaseManager

extension DatabaseManager {
    private var hybridSyncManager: HybridSyncManager?
    
    func setupHybridSync() {
        guard let database = database else { return }
        hybridSyncManager = HybridSyncManager(database: database)
    }
    
    func getSyncManager() -> HybridSyncManager? {
        return hybridSyncManager
    }
}
