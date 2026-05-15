export type MigrationData = {
  code: string;
  className: string;
  tableName: string;
  namespace: string | null;
  filePath: string | null;
  notes: string[];
};
