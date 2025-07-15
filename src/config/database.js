/**
 * Database configuration for local development and Azure production
 * Automatically switches between Cosmos DB Emulator and Azure Cosmos DB
 */

export const dbConfig = {
  // Local development (Cosmos DB Emulator)
  development: {
    endpoint: import.meta.env.VITE_COSMOS_DB_ENDPOINT || 'https://localhost:8081',
    key:
      import.meta.env.VITE_COSMOS_DB_KEY ||
      'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw==',
    databaseName: 'MappingAppDB',
    containers: {
      roads: 'GravelRoads',
      users: 'Users',
      analytics: 'Analytics',
    },
    options: {
      // Disable SSL verification for local emulator
      agent:
        import.meta.env.VITE_NODE_ENV === 'development'
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
    },
  },

  // Production (Azure Cosmos DB)
  production: {
    endpoint: import.meta.env.VITE_AZURE_COSMOS_ENDPOINT,
    key: import.meta.env.VITE_AZURE_COSMOS_KEY,
    databaseName: import.meta.env.VITE_AZURE_COSMOS_DATABASE || 'MappingAppDB',
    containers: {
      roads: 'GravelRoads',
      users: 'Users',
      analytics: 'Analytics',
    },
    options: {
      // Production SSL settings
      connectionPolicy: {
        requestTimeout: 30000,
        retryOptions: {
          maxRetryAttemptCount: 3,
          fixedRetryIntervalInMilliseconds: 1000,
        },
      },
    },
  },
};

// Get current environment config
export const getCurrentConfig = () => {
  const env = import.meta.env.VITE_NODE_ENV || 'development';
  return dbConfig[env];
};

// MongoDB-compatible connection (if using MongoDB API)
export const getMongoConfig = () => {
  const env = import.meta.env.VITE_NODE_ENV || 'development';

  if (env === 'development') {
    return {
      uri: 'mongodb://localhost:10255',
      options: {
        ssl: false,
        directConnection: true,
      },
    };
  }

  return {
    uri: import.meta.env.VITE_AZURE_COSMOS_MONGO_URI,
    options: {
      ssl: true,
      retryWrites: false,
    },
  };
};
