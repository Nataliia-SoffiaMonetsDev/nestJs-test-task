import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import * as mongoose from 'mongoose';

describe('ProductsController', () => {
    let controller: ProductsController;
    const product = {
        "name": "Product 1",
        "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis dolorem enim delectus odio doloremque repellat eveniet tempora perferendis repudiandae libero? Minima eligendi earum sed molestiae labore vero deleniti distinctio quia."
    };
    const productsService = {
        createProduct: jest.fn(dto => ({
            ...dto,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        getAllProducts: jest.fn(() => ([
            {
                ...product,
                _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
            }
        ])),
        getProduct: jest.fn(() => ({
            ...product,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        updateProduct: jest.fn((product) => ([{
            ...product,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        }])),
        deleteProduct: jest.fn(() => [])
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [ProductsService]
        }).overrideProvider(ProductsService).useValue(productsService).compile();

        controller = module.get<ProductsController>(ProductsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a product', () => {
        expect(controller.createProduct(product)).toEqual({
            _id: expect.any(mongoose.Types.ObjectId),
            name: product.name,
            description: product.description
        });
        expect(productsService.createProduct).toHaveBeenCalledWith(product);
    });

    it('should get all products', () => {
        expect(controller.getAllProducts()).toEqual([
            {
                _id: expect.any(mongoose.Types.ObjectId),
                name: product.name,
                description: product.description
            }
        ]);
        expect(productsService.getAllProducts).toHaveBeenCalled();
    });

    it('should get a certain product by id', () => {
        const id = '64870f92e622309b8eaa38f6';
        expect(controller.getProduct(id)).toEqual({
            _id: expect.any(mongoose.Types.ObjectId),
            name: product.name,
            description: product.description
        });
        expect(productsService.getProduct).toHaveBeenCalledWith(id);
    });

    it('should update a product', () => {
        expect(controller.updateProduct({ ...product, _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6') })).toEqual([{
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6'),
            name: product.name,
            description: product.description
        }]);
        expect(productsService.updateProduct).toHaveBeenCalledWith({ ...product, _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6') });
    });

    it('should delete a certain product by id', () => {
        const id = '64870f92e622309b8eaa38f6';
        expect(controller.deleteProduct(id)).not.toContain({
            _id: expect.any(mongoose.Types.ObjectId),
            name: product.name,
            description: product.description
        });
        expect(productsService.deleteProduct).toHaveBeenCalledWith(id);
    });

});