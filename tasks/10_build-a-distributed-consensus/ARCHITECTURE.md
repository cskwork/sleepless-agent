# Distributed Consensus Simulator - Architecture

## System Overview

The simulator is built with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Visualization Layer                    │
│  (Web UI: React + D3.js/Canvas for rendering)           │
└───────────────────┬─────────────────────────────────────┘
                    │ State queries, Control commands
┌───────────────────▼─────────────────────────────────────┐
│                  Simulator Controller                    │
│  (Orchestrates simulation, manages state history)       │
└───────────────────┬─────────────────────────────────────┘
                    │ Commands
┌───────────────────▼─────────────────────────────────────┐
│                   Event Simulator                        │
│  (Discrete event simulation engine)                      │
└─────┬─────────────────────────────────────┬─────────────┘
      │                                     │
┌─────▼──────────┐                 ┌───────▼────────────┐
│  Raft Engine   │                 │   Paxos Engine     │
│  - Election    │                 │   - Prepare/Promise│
│  - Replication │                 │   - Accept/Accepted│
│  - Safety      │                 │   - Multi-Paxos    │
└────────────────┘                 └────────────────────┘
```

## Core Components

### 1. Event Simulator
- **Purpose**: Manages virtual time and event scheduling
- **Key Classes**:
  - `Event`: Base event class with timestamp and priority
  - `EventQueue`: Priority queue for event ordering
  - `Simulator`: Main simulation engine
- **Responsibilities**:
  - Advance virtual time
  - Process events in order
  - Support deterministic replay via seeded RNG

### 2. Consensus Engines (Raft & Paxos)
- **Purpose**: Implement consensus algorithms
- **Key Classes**:
  - `RaftNode`: Single Raft server implementation
  - `PaxosNode`: Single Paxos acceptor/proposer
  - `Message`: Base message class for RPC
- **Responsibilities**:
  - Process algorithm-specific messages
  - Maintain state (logs, terms, etc.)
  - Generate events (timeouts, RPCs)

### 3. Network Simulator
- **Purpose**: Simulate network behavior
- **Key Classes**:
  - `NetworkSimulator`: Routes messages between nodes
  - `NetworkPartition`: Defines network splits
- **Responsibilities**:
  - Message delivery with configurable delays
  - Partition simulation
  - Message dropping/reordering

### 4. State Manager
- **Purpose**: Track simulation history
- **Key Classes**:
  - `StateSnapshot`: Immutable state at a point in time
  - `StateHistory`: Manages snapshot timeline
- **Responsibilities**:
  - Capture state after each event
  - Enable time-travel debugging
  - Efficient storage via structural sharing

### 5. Visualization Layer
- **Purpose**: Interactive UI for simulation
- **Key Components**:
  - Node renderer (state, logs)
  - Message animator
  - Timeline scrubber
  - Control panel
- **Technology**: React + D3.js/Canvas

## Data Flow

1. **Simulation Start**: User configures scenario (# nodes, algorithm, partitions)
2. **Event Processing**:
   - Simulator pops next event from queue
   - Event triggers node behavior
   - Node generates new events (messages, timeouts)
   - State snapshot captured
3. **Visualization Update**:
   - UI polls for state changes
   - Renders current state
   - Shows animations for messages in flight
4. **Interactive Control**:
   - User can pause/resume
   - Step forward/backward through history
   - Inject events (failures, partitions)

## Key Design Decisions

1. **Event-Driven**: All state changes happen via events (deterministic)
2. **Immutable Snapshots**: State history via immutable snapshots
3. **Pluggable Algorithms**: Easy to add new consensus algorithms
4. **Separation of Concerns**: Engine independent of visualization
5. **Educational First**: Clear state representation, explanatory annotations

## File Structure

```
/
├── src/
│   ├── core/
│   │   ├── event.py          # Event system
│   │   ├── simulator.py      # Main simulation engine
│   │   └── network.py        # Network simulator
│   ├── algorithms/
│   │   ├── raft/
│   │   │   ├── node.py       # Raft node implementation
│   │   │   ├── messages.py   # Raft RPC messages
│   │   │   └── state.py      # Raft state structures
│   │   └── paxos/
│   │       ├── node.py       # Paxos node implementation
│   │       ├── messages.py   # Paxos messages
│   │       └── state.py      # Paxos state structures
│   ├── state/
│   │   ├── snapshot.py       # State snapshot
│   │   └── history.py        # State history manager
│   ├── scenarios/
│   │   └── presets.py        # Preset scenarios
│   └── utils/
│       ├── logging.py        # Logging utilities
│       └── config.py         # Configuration
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NodeView.tsx  # Node visualization
│   │   │   ├── Timeline.tsx  # Timeline scrubber
│   │   │   └── Controls.tsx  # Control panel
│   │   ├── hooks/
│   │   │   └── useSimulator.ts
│   │   └── App.tsx
│   └── package.json
├── tests/
│   ├── test_raft.py
│   ├── test_paxos.py
│   └── test_scenarios.py
└── examples/
    └── demo.py
```

## Implementation Strategy

### Phase 1: Core Engine
1. Build event system
2. Implement network simulator
3. Create state management

### Phase 2: Raft Implementation
1. Basic state structures
2. Leader election
3. Log replication
4. Safety checks

### Phase 3: Paxos Implementation
1. Basic Paxos
2. Multi-Paxos for logs

### Phase 4: Visualization
1. Basic rendering
2. Interactive controls
3. Comparison view

### Phase 5: Polish
1. Educational annotations
2. Preset scenarios
3. Documentation
