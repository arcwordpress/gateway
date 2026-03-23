import type { MigrationData } from './MigrationData';
import type { MigrationExtension } from './MigrationExtension';
export type MigrationPanelState = {
  collectionKey: string;
  title: string;
  migration: MigrationData | null;
  loading: boolean;
  extensions: MigrationExtension[];
  extensionsLoading: boolean;
  installing: boolean;
  installSuccess: { message: string; filePath: string } | null;
  runningMigration: boolean;
};