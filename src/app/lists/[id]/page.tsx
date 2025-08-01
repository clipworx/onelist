import ListDetails from '@/components/List/Details'

export default function ListPage(context: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto">
      <ListDetails listId={context.params.id} />
    </div>
  )
}
