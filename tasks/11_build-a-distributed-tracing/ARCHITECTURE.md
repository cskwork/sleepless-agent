# Distributed Tracing Visualization Tool - Architecture

## System Overview

A full-stack web application for visualizing distributed traces from OpenTelemetry data, featuring flame graphs, service dependency maps, and anomaly detection.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Flame Graph  │ Dependency   │ Latency      │ Anomaly Detection │
│ Component    │ Map          │ Dashboard    │ UI                │
└──────────────┴──────────────┴──────────────┴───────────────────┘
                              │
                              │ REST API
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      Backend API Server                            │
├──────────────────────────────────────────────────────────────────┤
│  Ingestion Endpoint  │  Query API  │  Metrics API  │  Search API │
└──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
┌───────────────────▼──────┐  ┌────────▼─────────────────┐
│   Trace Processor        │  │   Analysis Engine        │
├──────────────────────────┤  ├──────────────────────────┤
│ - Span Parser            │  │ - Latency Analyzer       │
│ - Trace Reconstructor    │  │ - Dependency Extractor   │
│ - Validation             │  │ - Anomaly Detector       │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                   ┌──────────▼──────────┐
                   │   Storage Layer     │
                   ├─────────────────────┤
                   │ - In-Memory Indices │
                   │ - Trace Store       │
                   │ - Metrics Cache     │
                   └─────────────────────┘
```

## Data Models

### Core OpenTelemetry Entities

#### Span
```typescript
interface Span {
  traceId: string;              // Unique trace identifier
  spanId: string;               // Unique span identifier
  parentSpanId?: string;        // Parent span (if not root)
  name: string;                 // Operation name
  kind: SpanKind;               // CLIENT, SERVER, INTERNAL, etc.
  startTimeUnixNano: string;    // Start timestamp (nanoseconds)
  endTimeUnixNano: string;      // End timestamp (nanoseconds)
  attributes: Record<string, any>; // Key-value metadata
  status: SpanStatus;           // OK, ERROR, UNSET
  events: SpanEvent[];          // Timestamped events
  resource: Resource;           // Service/resource info
}
```

#### Trace (Reconstructed)
```typescript
interface Trace {
  traceId: string;
  rootSpan: SpanNode;           // Tree structure
  spans: Span[];                // Flat list of all spans
  services: Set<string>;        // Involved services
  totalDuration: number;        // End-to-end latency
  spanCount: number;
  errorCount: number;
}

interface SpanNode {
  span: Span;
  children: SpanNode[];
  depth: number;
  duration: number;             // In milliseconds
}
```

### Analysis Models

#### Latency Metrics
```typescript
interface LatencyMetrics {
  serviceName: string;
  operationName: string;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  count: number;
  errors: number;
}
```

#### Service Dependency
```typescript
interface ServiceDependency {
  caller: string;               // Source service
  callee: string;               // Target service
  callCount: number;
  avgLatency: number;
  errorRate: number;
}
```

#### Anomaly
```typescript
interface Anomaly {
  traceId: string;
  spanId: string;
  type: 'latency' | 'error' | 'cascade';
  severity: 'low' | 'medium' | 'high';
  description: string;
  expectedValue?: number;
  actualValue: number;
  zScore?: number;
}
```

## API Endpoints

### Ingestion
- `POST /api/traces` - Ingest OpenTelemetry trace data
- `POST /api/spans` - Ingest individual spans

### Query
- `GET /api/traces` - List traces (with filters)
- `GET /api/traces/:traceId` - Get specific trace with full tree
- `GET /api/spans/:spanId` - Get span details

### Analytics
- `GET /api/metrics/latency` - Latency statistics by service/operation
- `GET /api/dependencies` - Service dependency graph
- `GET /api/anomalies` - Detected anomalies
- `GET /api/services` - List of services with health metrics

## Component Responsibilities

### Backend Components

#### Span Parser
- Validates OpenTelemetry format
- Normalizes timestamps (nanoseconds → milliseconds)
- Extracts service names from resource attributes
- Handles both JSON and protobuf formats (Phase 1: JSON only)

#### Trace Reconstructor
- Groups spans by traceId
- Builds parent-child relationships using parentSpanId
- Creates tree structure for visualization
- Calculates derived metrics (duration, depth)

#### Storage Layer
- In-memory maps for fast access:
  - `traces: Map<traceId, Trace>`
  - `spans: Map<spanId, Span>`
  - `serviceIndex: Map<serviceName, spanIds[]>`
  - `tracesByTimestamp: SortedArray<Trace>`
- Efficient queries with O(1) or O(log n) lookups

#### Latency Analyzer
- Aggregates spans by service and operation
- Calculates percentiles using quantile algorithms
- Tracks historical trends (rolling windows)
- Identifies slow operations

#### Dependency Extractor
- Analyzes span relationships across services
- CLIENT span → SERVER span indicates service call
- Builds directed graph of service dependencies
- Calculates edge weights (latency, volume, errors)

#### Anomaly Detector
- **Latency Anomalies**: Z-score based detection (|z| > 3)
- **Error Anomalies**: Spans with error status
- **Cascade Failures**: Multiple services failing in trace
- **Statistical Baseline**: Rolling mean/stddev per operation

### Frontend Components

#### Flame Graph
- Canvas-based rendering for performance
- Each rect represents a span (width = duration)
- Color coding: by service, by latency, by status
- Interactive: hover for details, click to focus
- Zoom and pan capabilities

#### Dependency Map
- Force-directed graph or hierarchical layout
- Nodes = services, edges = dependencies
- Edge thickness = call volume
- Edge color = latency or error rate
- Interactive: click node to filter traces

#### Latency Dashboard
- Time series charts of p50/p95/p99
- Histogram of latency distribution
- Table of slowest operations
- Service comparison view

#### Anomaly Detection UI
- List of detected anomalies sorted by severity
- Visual indicators on flame graphs
- Filtering and search capabilities
- Drill-down to anomalous spans

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5+
- **Validation**: Zod for schema validation
- **Testing**: Jest

### Frontend
- **Framework**: React 18+ with Vite
- **Language**: TypeScript 5+
- **Visualization**: D3.js (flame graph), Cytoscape.js (dependency map)
- **Charts**: Recharts
- **UI**: Tailwind CSS
- **State**: React Context + hooks

### Build & Tooling
- **Monorepo**: Single repo with backend/ and frontend/
- **Package Manager**: npm workspaces
- **Linting**: ESLint
- **Formatting**: Prettier

## Data Flow

### Ingestion Flow
1. Client POSTs trace data to `/api/traces`
2. Span Parser validates and normalizes
3. Trace Reconstructor builds tree structure
4. Storage Layer persists in memory
5. Analysis Engine updates metrics asynchronously
6. Response: 201 Created with traceId

### Query Flow
1. Client requests `/api/traces/:traceId`
2. Storage Layer retrieves trace
3. Enrichment: add anomalies, metrics
4. Response: JSON with full trace tree

### Analysis Flow
1. Background job or on-demand trigger
2. Latency Analyzer calculates percentiles
3. Dependency Extractor builds graph
4. Anomaly Detector runs statistical tests
5. Results cached for fast querying

## Scalability Considerations

### Phase 1 (Prototype)
- In-memory storage (limited to ~10k spans)
- Single-process architecture
- No persistence (data lost on restart)

### Future Enhancements
- External storage: ClickHouse, TimescaleDB, or Elasticsearch
- Distributed processing: Apache Kafka for ingestion
- Time-based retention policies
- Sampling strategies for high-volume traces
- Real-time streaming with WebSockets

## Security & Performance

### Performance Targets
- Ingest: 1000 spans/second
- Query: <100ms for single trace retrieval
- Visualization: 60 FPS for flame graph with 500 spans

### Security
- Input validation on all endpoints
- Rate limiting on ingestion
- CORS configuration
- Authentication (future: API keys, OAuth)

## File Structure

```
distributed-tracing/
├── backend/
│   ├── src/
│   │   ├── models/          # TypeScript interfaces
│   │   ├── parsers/         # Span parsing logic
│   │   ├── storage/         # In-memory storage
│   │   ├── analysis/        # Metrics & anomaly detection
│   │   ├── api/             # Express routes
│   │   ├── utils/           # Helpers
│   │   └── server.ts        # Main entry point
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── FlameGraph/
│   │   │   ├── DependencyMap/
│   │   │   ├── LatencyDashboard/
│   │   │   └── AnomalyList/
│   │   ├── services/        # API client
│   │   ├── utils/           # Helpers
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── shared/                  # Shared types between BE/FE
│   └── types.ts
├── examples/                # Sample data
│   └── sample-traces.json
├── package.json             # Root package.json
└── README.md
```

## Development Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Project setup
- Data models
- Basic ingestion and storage
- Simple API

### Phase 2: Analysis Engine (Week 2)
- Latency metrics
- Dependency extraction
- Basic anomaly detection

### Phase 3: Visualization (Weeks 3-4)
- React app setup
- Flame graph implementation
- Dependency map
- Dashboard

### Phase 4: Polish & Testing (Week 4)
- Sample data generation
- Documentation
- Testing
- Bug fixes and optimization
