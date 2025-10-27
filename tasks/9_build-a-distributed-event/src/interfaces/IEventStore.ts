import { DomainEvent, EventStream } from '../types';

/**
 * Interface for Event Store implementations
 * Provides append-only event log with strong consistency guarantees
 */
export interface IEventStore {
  /**
   * Append events to an aggregate's event stream
   * @throws ConcurrencyError if expectedVersion doesn't match actual version
   */
  appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;

  /**
   * Get all events for an aggregate
   */
  getEvents(aggregateId: string, aggregateType: string): Promise<DomainEvent[]>;

  /**
   * Get events for an aggregate starting from a specific version
   */
  getEventsFromVersion(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number
  ): Promise<DomainEvent[]>;

  /**
   * Get event stream metadata
   */
  getEventStream(
    aggregateId: string,
    aggregateType: string
  ): Promise<EventStream | null>;

  /**
   * Get all events across all aggregates (for projections/replay)
   */
  getAllEvents(aggregateType?: string): Promise<DomainEvent[]>;

  /**
   * Check if aggregate exists
   */
  exists(aggregateId: string, aggregateType: string): Promise<boolean>;
}
