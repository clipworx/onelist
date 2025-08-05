import mongoose from 'mongoose'
import { Server as IOServer } from 'socket.io'

export const watchListChanges = async (io: IOServer) => {
  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: process.env.MONGODB_DB || 'onelist',
  })

  const listCollection = mongoose.connection.collection('lists')
  const changeStream = listCollection.watch([], { fullDocument: 'updateLookup' })

  changeStream.on('change', (change) => {
    if (change.operationType === 'update') {
      const doc = change.fullDocument
      const updatedFields = change.updateDescription.updatedFields
      const isProductUpdate = Object.keys(updatedFields).some((key) => key.startsWith('products'))

      if (isProductUpdate) {
        const productIdMatch = Object.keys(updatedFields).find((k) =>
          k.match(/^products\.\d+\.status/)
        )
        const productIndex = productIdMatch?.match(/^products\.(\d+)/)?.[1]

        if (productIndex !== undefined) {
          const product = doc.products[productIndex]
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
      const newProductIndex = Object.keys(updatedFields).find((k) =>
        k.match(/^products\.\d+$/)
      )?.match(/^products\.(\d+)$/)?.[1]

      if (newProductIndex !== undefined) {
        const newProduct = doc.products[newProductIndex]
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
  })
}
