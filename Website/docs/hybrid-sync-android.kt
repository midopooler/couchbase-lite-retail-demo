// Android Hybrid Sync Implementation
// File: HybridSyncManager.kt

package com.example.liquorapplication

import com.couchbase.lite.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import kotlinx.coroutines.*
import java.net.URL
import javax.net.ssl.HttpsURLConnection

enum class SyncMode(val displayName: String, val icon: String) {
    P2P("P2P", "network"),
    APP_SERVICES("App Services", "cloud"),
    OFFLINE("Offline", "wifi_off")
}

class HybridSyncManager(
    private val context: Context,
    private val database: Database
) {
    // State flows for UI
    private val _currentSyncMode = MutableStateFlow(SyncMode.OFFLINE)
    val currentSyncMode: StateFlow<SyncMode> = _currentSyncMode
    
    private val _isP2PAvailable = MutableStateFlow(false)
    val isP2PAvailable: StateFlow<Boolean> = _isP2PAvailable
    
    private val _isAppServicesAvailable = MutableStateFlow(false)
    val isAppServicesAvailable: StateFlow<Boolean> = _isAppServicesAvailable
    
    private val _syncStatus = MutableStateFlow("Offline")
    val syncStatus: StateFlow<String> = _syncStatus
    
    // Sync components
    private var currentReplicator: Replicator? = null
    private var p2pReplicator: Replicator? = null
    
    // P2P Configuration
    private val p2pPort = 4984
    private var p2pEndpoint: URLEndpoint? = null
    
    // App Services Configuration
    private val appServicesUrl = "wss://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB"
    private val appServicesUsername = "liquor_user"
    private val appServicesPassword = "password123"
    
    // Network monitoring
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    init {
        setupNetworkMonitoring()
        checkAvailability()
    }
    
    // MARK: - Public Interface
    
    fun setSyncMode(mode: SyncMode) {
        Log.d("HybridSync", "🔄 Switching sync mode from ${_currentSyncMode.value} to $mode")
        
        // Stop current sync
        stopCurrentSync()
        
        // Start new sync mode
        when (mode) {
            SyncMode.P2P -> {
                if (_isP2PAvailable.value) {
                    startP2PSync()
                    _currentSyncMode.value = SyncMode.P2P
                } else {
                    Log.w("HybridSync", "❌ P2P not available")
                    _syncStatus.value = "P2P not available"
                }
            }
            
            SyncMode.APP_SERVICES -> {
                if (_isAppServicesAvailable.value) {
                    startAppServicesSync()
                    _currentSyncMode.value = SyncMode.APP_SERVICES
                } else {
                    Log.w("HybridSync", "❌ App Services not available")
                    _syncStatus.value = "App Services not available"
                }
            }
            
            SyncMode.OFFLINE -> {
                _currentSyncMode.value = SyncMode.OFFLINE
                _syncStatus.value = "Offline mode"
            }
        }
    }
    
    // MARK: - Availability Checking
    
    private fun checkAvailability() {
        checkP2PAvailability()
        checkAppServicesAvailability()
    }
    
    private fun checkP2PAvailability() {
        // Check if on WiFi network for P2P
        val network = connectivityManager.activeNetwork
        val capabilities = connectivityManager.getNetworkCapabilities(network)
        
        val isWiFiConnected = capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
        _isP2PAvailable.value = isWiFiConnected
        
        Log.d("HybridSync", "📡 P2P Available: ${_isP2PAvailable.value}")
    }
    
    private fun checkAppServicesAvailability() {
        scope.launch(Dispatchers.IO) {
            try {
                val url = URL(appServicesUrl.replace("wss://", "https://"))
                val connection = url.openConnection() as HttpsURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                
                val responseCode = connection.responseCode
                val available = responseCode < 500 // Any response under 500 means service is reachable
                
                withContext(Dispatchers.Main) {
                    _isAppServicesAvailable.value = available
                    Log.d("HybridSync", "☁️ App Services Available: $available")
                }
                
                connection.disconnect()
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isAppServicesAvailable.value = false
                    Log.d("HybridSync", "☁️ App Services Available: false (${e.message})")
                }
            }
        }
    }
    
    // MARK: - P2P Sync
    
    private fun startP2PSync() {
        Log.d("HybridSync", "🔗 Starting P2P sync...")
        _syncStatus.value = "Starting P2P sync..."
        
        // For now, use a local P2P endpoint
        // In real implementation, you'd discover other devices
        try {
            val targetUrl = "ws://192.168.1.100:$p2pPort/LiquorInventoryDB" // Example P2P target
            p2pEndpoint = URLEndpoint(URI(targetUrl))
            
            val config = ReplicatorConfigurationFactory.newConfig(
                database = database,
                target = p2pEndpoint!!
            ).apply {
                replicatorType = ReplicatorType.PUSH_AND_PULL
                isContinuous = true
                
                // Basic auth for P2P
                authenticator = BasicAuthenticator("p2p_user", "p2p_password")
            }
            
            currentReplicator = Replicator(config)
            currentReplicator?.addChangeListener { change ->
                handleP2PChange(change)
            }
            
            currentReplicator?.start()
            _syncStatus.value = "P2P sync active"
            
        } catch (e: Exception) {
            Log.e("HybridSync", "❌ Failed to start P2P sync", e)
            _syncStatus.value = "P2P sync failed"
        }
    }
    
    private fun handleP2PChange(change: ReplicatorChange) {
        val status = when (change.status.activityLevel) {
            ReplicatorActivityLevel.CONNECTING -> "🔗 Connecting to peer..."
            ReplicatorActivityLevel.BUSY -> "🔗 Syncing with peer..."
            ReplicatorActivityLevel.IDLE -> "🔗 P2P sync ready"
            ReplicatorActivityLevel.STOPPED -> "🔗 P2P sync stopped"
            ReplicatorActivityLevel.OFFLINE -> "🔗 Peer offline"
        }
        
        _syncStatus.value = status
        Log.d("HybridSync", status)
        
        change.status.error?.let { error ->
            Log.e("HybridSync", "❌ P2P sync error: ${error.message}")
            _syncStatus.value = "🔗 P2P sync error"
        }
    }
    
    // MARK: - App Services Sync
    
    private fun startAppServicesSync() {
        Log.d("HybridSync", "☁️ Starting App Services sync...")
        _syncStatus.value = "Connecting to App Services..."
        
        try {
            val target = URLEndpoint(URI(appServicesUrl))
            
            val config = ReplicatorConfigurationFactory.newConfig(
                database = database,
                target = target
            ).apply {
                authenticator = BasicAuthenticator(appServicesUsername, appServicesPassword)
                replicatorType = ReplicatorType.PUSH_AND_PULL
                isContinuous = true
                channels = listOf("liquor-inventory")
            }
            
            currentReplicator = Replicator(config)
            currentReplicator?.addChangeListener { change ->
                handleAppServicesChange(change)
            }
            
            currentReplicator?.start()
            Log.d("HybridSync", "✅ App Services sync started")
            
        } catch (e: Exception) {
            Log.e("HybridSync", "❌ Failed to start App Services sync", e)
            _syncStatus.value = "App Services connection failed"
        }
    }
    
    private fun handleAppServicesChange(change: ReplicatorChange) {
        val status = when (change.status.activityLevel) {
            ReplicatorActivityLevel.CONNECTING -> "☁️ Connecting to cloud..."
            ReplicatorActivityLevel.BUSY -> "☁️ Syncing with cloud..."
            ReplicatorActivityLevel.IDLE -> "☁️ Cloud sync ready"
            ReplicatorActivityLevel.STOPPED -> "☁️ Cloud sync stopped"
            ReplicatorActivityLevel.OFFLINE -> "☁️ Cloud offline"
        }
        
        _syncStatus.value = status
        Log.d("HybridSync", status)
        
        change.status.error?.let { error ->
            Log.e("HybridSync", "❌ App Services error: ${error.message}")
            _syncStatus.value = "☁️ Cloud sync error"
        }
    }
    
    // MARK: - Sync Management
    
    private fun stopCurrentSync() {
        Log.d("HybridSync", "🛑 Stopping current sync...")
        
        currentReplicator?.stop()
        currentReplicator = null
        p2pReplicator?.stop()
        p2pReplicator = null
        
        _syncStatus.value = "Sync stopped"
    }
    
    private fun setupNetworkMonitoring() {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        
        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                Log.d("HybridSync", "📡 Network available")
                checkAvailability()
            }
            
            override fun onLost(network: Network) {
                Log.d("HybridSync", "📡 Network lost")
                _isP2PAvailable.value = false
                _isAppServicesAvailable.value = false
            }
            
            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
                checkAvailability()
            }
        }
        
        connectivityManager.registerNetworkCallback(request, networkCallback!!)
    }
    
    fun cleanup() {
        stopCurrentSync()
        networkCallback?.let { 
            connectivityManager.unregisterNetworkCallback(it)
        }
        scope.cancel()
    }
}

// MARK: - Compose UI Component

@Composable
fun SyncModeSelector(
    syncManager: HybridSyncManager,
    modifier: Modifier = Modifier
) {
    val currentMode by syncManager.currentSyncMode.collectAsState()
    val isP2PAvailable by syncManager.isP2PAvailable.collectAsState()
    val isAppServicesAvailable by syncManager.isAppServicesAvailable.collectAsState()
    val syncStatus by syncManager.syncStatus.collectAsState()
    
    Card(
        modifier = modifier.padding(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Sync Mode",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            // Mode Selection
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                SyncMode.values().forEach { mode ->
                    val isEnabled = when (mode) {
                        SyncMode.P2P -> isP2PAvailable
                        SyncMode.APP_SERVICES -> isAppServicesAvailable
                        SyncMode.OFFLINE -> true
                    }
                    
                    FilterChip(
                        onClick = { 
                            if (isEnabled) {
                                syncManager.setSyncMode(mode)
                            }
                        },
                        label = { Text(mode.displayName) },
                        selected = currentMode == mode,
                        enabled = isEnabled,
                        leadingIcon = {
                            Icon(
                                painter = painterResource(
                                    id = when (mode.icon) {
                                        "network" -> R.drawable.ic_network
                                        "cloud" -> R.drawable.ic_cloud
                                        else -> R.drawable.ic_wifi_off
                                    }
                                ),
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Availability Indicators
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // P2P Status
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(
                                color = if (isP2PAvailable) Color.Green else Color.Red,
                                shape = CircleShape
                            )
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "P2P",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                // App Services Status
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(
                                color = if (isAppServicesAvailable) Color.Green else Color.Red,
                                shape = CircleShape
                            )
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Cloud",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Current Status
            Text(
                text = syncStatus,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// MARK: - Integration with MainActivity

class MainActivity : ComponentActivity() {
    private lateinit var hybridSyncManager: HybridSyncManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Couchbase Lite
        CouchbaseLite.init()
        val database = Database("LiquorInventoryDB")
        
        // Initialize hybrid sync manager
        hybridSyncManager = HybridSyncManager(this, database)
        
        setContent {
            LiquorApplicationTheme {
                LiquorInventoryApp(hybridSyncManager)
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        hybridSyncManager.cleanup()
    }
}
