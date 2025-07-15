# New Zealand Cadastral and Paper Road Data

This application now includes **authentic NZ cadastral data** from Land Information New Zealand (LINZ) using an official API key.

## Available Official NZ Cadastral Layers

The following overlay layers are available via the layers control (top-right corner of the map):

### 1. **NZ Property Boundaries** ⭐

- Official property parcel boundaries from LINZ
- Shows individual land ownership and subdivision patterns
- Essential for property research and development planning
- Opacity: 70% for clear visibility over base layers

### 2. **NZ Building Outlines** 🏠

- Detailed building footprints from LINZ building outlines dataset
- Shows actual building shapes and sizes
- Useful for urban analysis and development planning
- Opacity: 80% for clear building identification

### 3. **NZ Road Centrelines** 🛣️

- Official road network from LINZ transport data
- Includes all public roads, highways, and local streets
- Shows the legal road network including paper roads
- Opacity: 60% to work well with base layers

### 4. **NZ Railway Centrelines** 🚂

- Official railway network data from LINZ
- Shows active and historic railway lines
- Important for transport planning and infrastructure analysis
- Opacity: 80% for clear railway identification

### 5. **NZ Hydrographic Polygons** 💧

- Lakes, rivers, and water bodies from LINZ hydrographic data
- Official water body boundaries and features
- Essential for environmental and flood planning
- Opacity: 60% to blend with satellite imagery

### 6. **Place Names & Labels** 📍

- Additional place name labels for enhanced navigation
- Complements the official LINZ data with readable labels
- Opacity: 90% for clear text visibility

## Official NZ Base Layers

### **LINZ Topographic Maps** 🗺️

- Official NZ Survey 260 series topographic maps
- Detailed contours, tracks, and geographic features
- Authoritative mapping for outdoor activities and surveying

### **LINZ Aerial Imagery** 📸

- Latest high-resolution aerial photography of New Zealand
- Updated regularly with the most current imagery
- Essential for visual analysis and property assessment

## How to Use

1. **Base Layer Selection**: Choose from LINZ official maps in the side panel
2. **Toggle Cadastral Overlays**: Use the layers control (📋 icon, top-right)
3. **Combine Data**: Multiple overlays work together for comprehensive analysis
4. **Zoom for Detail**: Higher zoom levels show more detailed cadastral information

## Data Quality & Currency

- **Source**: Official Land Information New Zealand (LINZ) datasets
- **License**: CC BY 4.0 - Free to use with attribution
- **Currency**: Data is updated regularly from authoritative government sources
- **Accuracy**: Survey-grade accuracy suitable for professional use

## Use Cases

### **Property & Development**

- Property boundary verification
- Building setback analysis
- Development feasibility studies
- Section subdivision planning

### **Infrastructure Planning**

- Road network analysis
- Railway corridor planning
- Water body identification
- Utility corridor planning

### **Government & Local Authority**

- Planning applications assessment
- Resource consent processing
- Infrastructure asset management
- Emergency services planning

### **Professional Services**

- Surveying reference data
- Legal property research
- Environmental impact assessment
- Engineering design reference

## Technical Specifications

- **Projection**: EPSG:3857 (Web Mercator)
- **Format**: PNG tiles with transparency
- **Resolution**: Multiple zoom levels (1-18)
- **API**: LINZ Data Service REST API
- **Authentication**: Secure API key authentication

## Data Layers Details

| Layer                 | LINZ ID | Update Frequency | Coverage          |
| --------------------- | ------- | ---------------- | ----------------- |
| Property Boundaries   | 50804   | Continuous       | Nationwide        |
| Building Outlines     | 101290  | Quarterly        | Major urban areas |
| Road Centrelines      | 50329   | Continuous       | Nationwide        |
| Railway Centrelines   | 50319   | As required      | Nationwide        |
| Hydrographic Polygons | 50293   | As required      | Nationwide        |

This application now provides access to New Zealand's authoritative spatial data infrastructure, enabling professional-grade analysis and decision-making with official government datasets.
