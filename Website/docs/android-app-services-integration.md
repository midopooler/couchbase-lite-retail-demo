# Android App Services Integration

## Update build.gradle.kts (app level)

```kotlin
dependencies {
    implementation "com.couchbase.lite:couchbase-lite-android:3.1.0"
    implementation "com.couchbase.lite:couchbase-lite-android-ktx:3.1.0"
    // Remove any P2P networking dependencies
}
```

## Create AppServicesManager.kt

```kotlin
package com.example.liquorapplication

import com.couchbase.lite.*
import com.couchbase.lite.internal.core.C4Replicator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import android.util.Log

class AppServicesManager {
    private var database: Database? = null
    private var replicator: Replicator? = null
    
    // App Services Configuration
    private val syncGatewayUrl = "wss://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB"
    private val username = "liquor_user"
    private val password = "password123"
    private val databaseName = "LiquorInventoryDB"
    
    // Sync status
    private val _syncStatus = MutableStateFlow("Disconnected")
    val syncStatus: StateFlow<String> = _syncStatus
    
    init {
        setupDatabase()
        setupAppServicesSync()
    }
    
    private fun setupDatabase() {
        try {
            // Initialize Couchbase Lite
            CouchbaseLite.init()
            
            // Open database
            database = Database(databaseName)
            Log.d("AppServices", "✅ Database opened: $databaseName")
        } catch (e: CouchbaseLiteException) {
            Log.e("AppServices", "❌ Failed to open database", e)
        }
    }
    
    private fun setupAppServicesSync() {
        database?.let { db ->
            try {
                // Create target endpoint
                val target = URLEndpoint(URI(syncGatewayUrl))
                
                // Create replicator configuration
                val config = ReplicatorConfigurationFactory.newConfig(
                    database = db,
                    target = target
                ).apply {
                    // Set authentication
                    authenticator = BasicAuthenticator(username, password)
                    
                    // Configure sync type
                    type = ReplicatorType.PUSH_AND_PULL
                    
                    // Enable continuous sync
                    isContinuous = true
                    
                    // Set channels
                    channels = listOf("liquor-inventory")
                }
                
                // Create replicator
                replicator = Replicator(config)
                
                // Add status change listener
                replicator?.addChangeListener { change ->
                    handleReplicatorChange(change)
                }
                
                // Start replication
                replicator?.start()
                Log.d("AppServices", "✅ App Services replication started")
                
            } catch (e: Exception) {
                Log.e("AppServices", "❌ Failed to setup App Services sync", e)
            }
        }
    }
    
    private fun handleReplicatorChange(change: ReplicatorChange) {
        val status = when (change.status.activityLevel) {
            ReplicatorActivityLevel.CONNECTING -> {
                "🔄 Connecting to App Services..."
            }
            ReplicatorActivityLevel.BUSY -> {
                "📡 Syncing with App Services..."
            }
            ReplicatorActivityLevel.IDLE -> {
                "✅ App Services sync idle"
            }
            ReplicatorActivityLevel.STOPPED -> {
                "🛑 App Services sync stopped"
            }
            ReplicatorActivityLevel.OFFLINE -> {
                "📴 App Services offline"
            }
        }
        
        _syncStatus.value = status
        Log.d("AppServices", status)
        
        change.status.error?.let { error ->
            Log.e("AppServices", "❌ Sync error: ${error.message}")
        }
    }
    
    // Database operations
    fun getAllLiquorItems(): List<LiquorItem> {
        val items = mutableListOf<LiquorItem>()
        
        database?.let { db ->
            try {
                val query = QueryBuilder
                    .select(SelectResult.all())
                    .from(DataSource.database(db))
                    .where(Expression.property("type").equalTo(Expression.string("liquor_item")))
                
                query.execute().use { resultSet ->
                    for (result in resultSet) {
                        val dict = result.getDictionary(databaseName)
                        dict?.let {
                            val item = LiquorItem(
                                id = it.getString("id") ?: "",
                                name = it.getString("name") ?: "",
                                type = it.getString("liquor_type") ?: "",
                                price = it.getDouble("price"),
                                imageURL = it.getString("imageURL") ?: "",
                                quantity = it.getInt("quantity")
                            )
                            items.add(item)
                        }
                    }
                }
            } catch (e: CouchbaseLiteException) {
                Log.e("AppServices", "❌ Failed to query items", e)
            }
        }
        
        return items
    }
    
    fun updateItemQuantity(id: String, newQuantity: Int) {
        database?.let { db ->
            try {
                val doc = db.getDocument(id)?.toMutable() ?: MutableDocument(id)
                doc.setInt("quantity", newQuantity)
                doc.setString("type", "liquor_item")
                doc.setDate("last_updated", Date())
                
                db.save(doc)
                Log.d("AppServices", "✅ Updated item $id quantity to $newQuantity")
            } catch (e: CouchbaseLiteException) {
                Log.e("AppServices", "❌ Failed to update item", e)
            }
        }
    }
    
    fun cleanup() {
        replicator?.stop()
        database?.close()
    }
}

// Data class for LiquorItem
data class LiquorItem(
    val id: String,
    val name: String,
    val type: String,
    val price: Double,
    val imageURL: String,
    val quantity: Int
)
```

## Update MainActivity.kt

```kotlin
class MainActivity : ComponentActivity() {
    private lateinit var appServicesManager: AppServicesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize App Services
        appServicesManager = AppServicesManager()
        
        setContent {
            LiquorApplicationTheme {
                LiquorInventoryApp(appServicesManager)
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        appServicesManager.cleanup()
    }
}
```

## Remove P2P Components
- Delete any P2P networking code
- Remove local-only database operations
- Update UI to show App Services sync status
