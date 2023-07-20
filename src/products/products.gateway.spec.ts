import { Test } from '@nestjs/testing';
import { ProductsGateway } from './products.gateway';
import { ProductDto } from './dto/product.dto';
import * as mongoose from 'mongoose';
import { Server } from 'socket.io';

describe('ProductsGateway', () => {
    let productsGateway: ProductsGateway;
    let mockServer: Server;

    const products: ProductDto[] = [
        {
            "_id": new mongoose.Types.ObjectId("64870f92e622309b8eaa38f6"),
            "name": "Product 1",
            "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis dolorem enim delectus odio doloremque repellat eveniet tempora perferendis repudiandae libero? Minima eligendi earum sed molestiae labore vero deleniti distinctio quia."
        },
        {
            "_id": new mongoose.Types.ObjectId("64870f92e622309b8eaa38f9"),
            "name": "Product 2",
            "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis dolorem enim delectus odio doloremque repellat eveniet tempora perferendis repudiandae libero? Minima eligendi earum sed molestiae labore vero deleniti distinctio quia."
        }
    ];

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [ProductsGateway],
        }).compile();

        productsGateway = module.get<ProductsGateway>(ProductsGateway);

        mockServer = {
            emit: jest.fn(),
        } as any;

        productsGateway.server = mockServer;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle product creation and emit newProduct', () => {
        const product: ProductDto = products[0];
        productsGateway.handleProductCreation(product);
        expect(mockServer.emit).toHaveBeenCalledWith('newProduct', product);
    });

    it('should handle product update and emit updatedProducts', () => {
        const updatedProductId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId('64870f92e622309b8eaa38f9');
        productsGateway.handleProductUpdate(products, updatedProductId);
        expect(mockServer.emit).toHaveBeenCalledWith('updatedProducts', [products, { updatedProductId }]);
    });

    it('should handle product delete and emit productsAfterDelete', () => {
        const deletedProductName: string = 'Product 1';
        productsGateway.handleProductDelete(products, deletedProductName);
        expect(mockServer.emit).toHaveBeenCalledWith('productsAfterDelete', [products, { deletedProductName }]);
    });
});
