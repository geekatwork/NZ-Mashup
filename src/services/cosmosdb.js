/**
 * Cosmos DB Client - Works seamlessly between local emulator and Azure
 */

class CosmosDBClient {
  constructor() {
    this.endpoint = import.meta.env.VITE_COSMOS_DB_ENDPOINT;
    this.key = import.meta.env.VITE_COSMOS_DB_KEY;
    this.databaseName = import.meta.env.VITE_DATABASE_NAME || 'MappingAppDB';
    this.isLocal = import.meta.env.VITE_NODE_ENV === 'development';
  }

  // Initialize connection (same code for local and Azure!)
  async initializeDatabase() {
    const { CosmosClient } = await import('@azure/cosmos');

    const options = {
      endpoint: this.endpoint,
      key: this.key,
    };

    // Disable SSL verification for local emulator
    if (this.isLocal) {
      options.agent = { rejectUnauthorized: false };
    }

    this.client = new CosmosClient(options);
    this.database = this.client.database(this.databaseName);

    // Create database if it doesn't exist
    await this.database.read();

    // Initialize containers
    await this.initializeContainers();
  }

  async initializeContainers() {
    const containers = [
      {
        id: 'GravelRoads',
        partitionKey: { paths: ['/region'] },
        indexingPolicy: {
          includedPaths: [{ path: '/bounds/*' }, { path: '/properties/*' }],
        },
      },
      {
        id: 'Users',
        partitionKey: { paths: ['/userId'] },
      },
      {
        id: 'Analytics',
        partitionKey: { paths: ['/date'] },
        timeToLiveInSeconds: 2592000, // 30 days TTL
      },
    ];

    for (const containerConfig of containers) {
      try {
        await this.database.container(containerConfig.id).read();
      } catch (error) {
        if (error.code === 404) {
          await this.database.containers.create(containerConfig);
          console.log(`Created container: ${containerConfig.id}`);
        }
      }
    }
  }

  // Store gravel roads data
  async storeGravelRoads(bounds, geoJsonData) {
    const container = this.database.container('GravelRoads');

    const document = {
      id: `roads_${Date.now()}`,
      region: this.getBoundsRegion(bounds),
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      geoJson: geoJsonData,
      fetchedAt: new Date().toISOString(),
      ttl: 3600, // Cache for 1 hour
    };

    return await container.items.create(document);
  }

  // Retrieve cached gravel roads
  async getCachedGravelRoads(bounds) {
    const container = this.database.container('GravelRoads');
    const region = this.getBoundsRegion(bounds);

    const query = {
      query: `
        SELECT * FROM c 
        WHERE c.region = @region 
        AND c.bounds.north >= @north 
        AND c.bounds.south <= @south
        AND c.bounds.east >= @east 
        AND c.bounds.west <= @west
        ORDER BY c.fetchedAt DESC
      `,
      parameters: [
        { name: '@region', value: region },
        { name: '@north', value: bounds.getNorth() },
        { name: '@south', value: bounds.getSouth() },
        { name: '@east', value: bounds.getEast() },
        { name: '@west', value: bounds.getWest() },
      ],
    };

    const { resources } = await container.items.query(query).fetchAll();
    return resources.length > 0 ? resources[0] : null;
  }

  // Track analytics
  async logAnalytics(event, data = {}) {
    const container = this.database.container('Analytics');

    const document = {
      id: `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0], // Partition by date
      event,
      data,
      timestamp: new Date().toISOString(),
      // eslint-disable-next-line no-undef
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-Side',
    };

    return await container.items.create(document);
  }

  getBoundsRegion(bounds) {
    // Simple region calculation for partitioning
    const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
    const centerLng = (bounds.getEast() + bounds.getWest()) / 2;

    // New Zealand regions (adjust as needed)
    if (centerLat > -41 && centerLng > 172) return 'north_island_east';
    if (centerLat > -41 && centerLng <= 172) return 'north_island_west';
    if (centerLat <= -41 && centerLng > 172) return 'south_island_east';
    return 'south_island_west';
  }
}

// Export singleton instance
export const cosmosDB = new CosmosDBClient();
