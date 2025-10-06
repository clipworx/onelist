import ListDetails from '@/components/List/Details'

type Params = {
    id: string
  }

export default async function ListPage({ params }: { params: Params }) {
  const { id } = params
  return (
    <div className="max-w-2xl mx-auto mt-6">
      <ListDetails listId={id} />
    </div>
  )
}
