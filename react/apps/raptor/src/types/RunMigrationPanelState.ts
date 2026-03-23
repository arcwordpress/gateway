export type RunMigrationPanelState = {
  collectionKey: string;
  title: string;
  table: string;
  beforeRecordCount: number;
  running: boolean;
  result: { success: boolean; message: string } | null;
  afterRecordCount: number | null;
};