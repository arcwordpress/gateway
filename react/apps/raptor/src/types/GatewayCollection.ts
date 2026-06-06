import type { RouteInfo } from './RouteInfo';

export type CollectionRelationship = {
  name: string;
  type: 'HasMany' | 'BelongsTo' | 'HasOne' | 'BelongsToMany';
  target_key: string;
};

export type GatewayCollection = {
  key: string;
  title: string;
  titlePlural: string;
  className: string;
  fqcn: string;
  table: string;
  record_count: number;
  routes: RouteInfo[];
  relationships?: CollectionRelationship[];
};