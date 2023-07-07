import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ProductDto } from './dto/product.dto';
import * as mongoose from 'mongoose';

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class ProductsGateway {

    @WebSocketServer()
    server: Server;

    async handleProductCreation(product: ProductDto): Promise<void> {
        this.server.emit('newProduct', product);
    }

    async handleProductUpdate(products: ProductDto[], updatedProductId: mongoose.Types.ObjectId): Promise<void> {
        this.server.emit('updatedProducts', [products, { updatedProductId }]);
    }

    async handleProductDelete(products: ProductDto[], deletedProductName: string): Promise<void> {
        this.server.emit('productsAfterDelete', [products, { deletedProductName }]);
    }
}

