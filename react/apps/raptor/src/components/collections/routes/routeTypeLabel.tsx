export default function routeTypeLabel(type: string): string {
  const map: Record<string, string> = {
    get_many: 'Get Many',
    get_one:  'Get One',
    create:   'Create',
    update:   'Update',
    delete:   'Delete',
  }
  return map[type] ?? type
}