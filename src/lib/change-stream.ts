import mongoose from 'mongoose'
import { Server as IOServer } from 'socket.io'

export const watchListChanges = async (io: IOServer) => {
  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: process.env.MONGODB_DB || 'onelist',
  })

  const listCollection = mongoose.connection.collection('lists')
  const changeStream = listCollection.watch([], { fullDocument: 'updateLookup' })

  changeStream.on('change', (change) => {
    try {
      // we only care about updates here (you can add 'replace' handling if needed)
      if (change.operationType !== 'update') return

      const doc = change.fullDocument
      const updatedFields = change.updateDescription?.updatedFields || {}

      // collect product indexes that were touched (e.g. keys like "products.2.quantityLacking")
      const productIndexes = new Set<number>()
      for (const key of Object.keys(updatedFields)) {
        const m = key.match(/^products\.(\d+)(?:\..+)?$/)
        if (m) productIndexes.add(Number(m[1]))
      }

      // process each touched product index
      for (const idx of productIndexes) {
        const product = doc.products?.[idx]
        if (!product) continue

        // determine which subfields of this product were changed
        const prefix = `products.${idx}.`
        const changedSubfields = Object.keys(updatedFields)
          .filter((k) => k.startsWith(prefix))
          .map((k) => k.slice(prefix.length))

        // If quantityLacking changed AND the product's current status is 'partial', emit
        if (changedSubfields.includes('quantityLacking')) {
          if (product.status === 'partial') {
            io.emit('productQuantityLackingUpdated', {
              listId: doc._id.toString(),
              productId: product._id.toString(),
              quantityLacking: product.quantityLacking,
            })
            
            console.log(
              `${doc.name} product updated: ${product.name} quantityLacking -> ${product.quantityLacking}`
            )
          }
        }

        // (Optional) Existing logic for status updates if you still want to emit them
        if (changedSubfields.includes('status')) {
          io.emit('productUpdated', {
            listId: doc._id.toString(),
            productId: product._id.toString(),
            status: product.status,
            completedBy: product.completedBy,
            quantityLacking: product.quantityLacking,
          })
          console.log(
            `${doc.name} product updated: ${product.name} with status: ${product.status}`
          )
        }
      }
      
      // If your existing logic handles newly added items (e.g. updatedFields has "products.3"),
      // keep that behavior - example below:
      const newProductKey = Object.keys(updatedFields).find((k) => k.match(/^products\.\d+$/))
      if (newProductKey) {
        const newIdx = Number(newProductKey.match(/^products\.(\d+)$/)![1])
        const newProduct = doc.products?.[newIdx]
        if (newProduct) {
          io.emit('productAdded', {
            listId: doc._id.toString(),
            product: {
              id: newProduct._id.toString(),
              name: newProduct.name,
              quantity: newProduct.quantity,
              addedBy: newProduct.addedBy,
              status: newProduct.status,
              completedBy: newProduct.completedBy,
              quantityLacking: newProduct.quantityLacking,
            },
          })
          console.log(`${doc.name} product added: ${newProduct.name}`)
        }
      }

      const changedSubfields = Object.keys(updatedFields)
      if (changedSubfields.some(f => f.startsWith('sharedWith'))) {
        io.emit('listSharedWithUpdated', {
          listId: doc._id.toString(),
          sharedWith: doc.sharedWith
        })
      }
    } catch (err) {
      console.error('Error processing change stream event', err)
    }
  })
}
