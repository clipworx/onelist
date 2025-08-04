import ListDetails from '@/components/List/Details'

export default async function ListPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return (
    <div className="max-w-2xl mx-auto">
      <ListDetails listId={id} />
    </div>
  )
}
