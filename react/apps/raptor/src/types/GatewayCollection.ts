import type { RouteInfo } from './RouteInfo';
export type GatewayCollection = {
  key: string;
  title: string;
  titlePlural: string;
  className: string;
  fqcn: string;
  table: string;
  record_count: number;
  routes: RouteInfo[];
};