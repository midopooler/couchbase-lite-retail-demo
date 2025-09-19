# Couchbase App Services Setup Guide

## Phase 1: Couchbase Capella Setup

### 1. Create Couchbase Capella Account
1. Go to https://cloud.couchbase.com/
2. Sign up for a free tier account
3. Create a new cluster:
   - **Name**: `LiquorApp-Cluster`
   - **Provider**: AWS/Azure/GCP (choose your preference)
   - **Region**: Choose closest to your users
   - **Configuration**: Single node (for development)

### 2. Create Database and Bucket
```bash
# Bucket Configuration
Bucket Name: LiquorInventoryDB
Memory Quota: 256 MB (sufficient for development)
Durability: Majority (recommended)
Conflict Resolution: Timestamp (for multi-device sync)
```

### 3. Create Database Collections
```bash
# Collections to create:
1. liquor_items     # Main inventory items
2. users           # User authentication
3. sync_metadata   # Sync tracking
```

## Phase 2: App Services Configuration

### 1. Enable App Services
1. In Capella console, go to "App Services"
2. Click "Create App Service"
3. Configuration:
   - **Name**: `LiquorApp-Sync`
   - **Database**: Link to your `LiquorInventoryDB`
   - **Import Filter**: Import all documents initially
   - **Delta Sync**: Enable (for efficient sync)

### 2. Sync Gateway Configuration
```json
{
  "logging": {
    "log_level": "info",
    "log_keys": ["*"]
  },
  "databases": {
    "LiquorInventoryDB": {
      "server": "couchbases://cb.YOUR_CLUSTER.cloud.couchbase.com",
      "bucket": "LiquorInventoryDB",
      "username": "sync_gateway",
      "password": "YOUR_PASSWORD",
      "enable_shared_bucket_access": true,
      "import_docs": true,
      "delta_sync": {
        "enabled": true
      },
      "sync": `
        function(doc, oldDoc) {
          // Basic sync function
          if (doc.type === 'liquor_item') {
            channel(['liquor-inventory']);
          }
          if (doc.type === 'user') {
            channel(['user-' + doc.user_id]);
          }
        }
      `,
      "users": {
        "liquor_user": {
          "password": "password123",
          "admin_channels": ["*"]
        }
      }
    }
  }
}
```

## Phase 3: Authentication Setup

### 1. Create App Services App
```json
{
  "name": "LiquorApp",
  "location": "US-EAST-1",
  "deployment_model": "GLOBAL",
  "environment": "development"
}
```

### 2. Authentication Providers
- **Anonymous Authentication**: For development/demo
- **Email/Password**: For production users
- **Custom JWT**: For enterprise integration

## Connection Details

### Sync Gateway Endpoint
```
wss://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB
```

### REST API Endpoint
```
https://YOUR_APP_ID.apps.cloud.couchbase.com:4984/LiquorInventoryDB
```

### Admin Interface
```
https://YOUR_APP_ID.apps.cloud.couchbase.com:4985/_admin/
```

## Next Steps
1. Set up iOS app integration
2. Set up Android app integration  
3. Set up React web app integration
4. Test real-time synchronization
