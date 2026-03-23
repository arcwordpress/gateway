import type { MigrationPanelState } from './MigrationPanelState';
import type { RouteTestPanelState } from './RouteTestPanelState';
import type { RunMigrationPanelState } from './RunMigrationPanelState';
export type PanelState =
  | { mode: 'migration'; data: MigrationPanelState }
  | { mode: 'routeTest'; data: RouteTestPanelState }
  | { mode: 'runMigration'; data: RunMigrationPanelState }
  | null;