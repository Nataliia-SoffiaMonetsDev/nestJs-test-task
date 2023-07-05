import { SubscribeMessage, WebSocketServer, WebSocketGateway, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ProductsGateway {

    constructor(private productsService: ProductsService) {}

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('createProduct')
    async createProduct(@MessageBody() product: ProductDto) {
        const createdProduct = await this.productsService.createProduct(product);
        this.server.emit('newProduct', createdProduct);
    }

    @SubscribeMessage('updateProduct')
    async updateProduct(@MessageBody() product: ProductDto) {
        const updatedProducts = await this.productsService.updateProduct(product);
        this.server.emit('updatedProducts', [updatedProducts, { updatedProductId: product._id }]);
    }

    @SubscribeMessage('deleteProduct')
    async deleteProduct(@MessageBody() id: string) {
        const product = await this.productsService.getProduct(id)
        const products = await this.productsService.deleteProduct(id);
        this.server.emit('productsAfterDelete', [products, { deletedProductName: product.name }]);
    }
}

