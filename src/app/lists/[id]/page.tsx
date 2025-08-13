import ListDetails from '@/components/List/Details'

export default async function ListPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return (
    <div className="max-w-2xl mx-auto mt-6">
      <ListDetails listId={id} />
    </div>
  )
}
