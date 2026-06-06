import RegisteredExtensionsCard from '../components/extensions/RegisteredExtensionsCard'

export default function ExtensionsPage() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <RegisteredExtensionsCard />
      </div>
    </div>
  )
}
