/**
 * Core type definitions for the Event Sourcing Framework
 */

/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Base interface for commands
 */
export interface Command {
  commandId: string;
  aggregateId: string;
  aggregateType: string;
  commandType: string;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Snapshot of aggregate state at a specific version
 */
export interface Snapshot {
  aggregateId: string;
  aggregateType: string;
  version: number;
  state: any;
  timestamp: Date;
}

/**
 * Event stream represents all events for a single aggregate
 */
export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
}

/**
 * Result of command execution
 */
export interface CommandResult {
  success: boolean;
  aggregateId: string;
  version: number;
  events: DomainEvent[];
  error?: Error;
}

/**
 * Concurrency exception thrown when version conflict detected
 */
export class ConcurrencyError extends Error {
  constructor(
    public aggregateId: string,
    public expectedVersion: number,
    public actualVersion: number
  ) {
    super(
      `Concurrency conflict for aggregate ${aggregateId}: expected version ${expectedVersion}, actual version ${actualVersion}`
    );
    this.name = 'ConcurrencyError';
  }
}

/**
 * Aggregate not found exception
 */
export class AggregateNotFoundError extends Error {
  constructor(public aggregateId: string, public aggregateType: string) {
    super(`Aggregate ${aggregateType} with id ${aggregateId} not found`);
    this.name = 'AggregateNotFoundError';
  }
}

/**
 * Configuration for snapshot behavior
 */
export interface SnapshotConfig {
  enabled: boolean;
  frequency: number; // Take snapshot every N events
}

/**
 * Configuration for event store
 */
export interface EventStoreConfig {
  storagePath?: string;
  snapshot?: SnapshotConfig;
}

/**
 * Handler for commands
 */
export type CommandHandler<T extends Command = Command> = (
  command: T
) => Promise<CommandResult>;

/**
 * Handler for events (projections, read models, etc)
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void>;

/**
 * Projection interface for read models
 */
export interface Projection {
  name: string;
  handleEvent(event: DomainEvent): Promise<void>;
  rebuild?(): Promise<void>;
}
