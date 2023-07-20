import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { ProductsService } from './products.service';
import { Product } from './product.model';
import { ProductsGateway } from './products.gateway';

describe('ProductService', () => {
    let service: ProductsService;
    let model: Model<Product>;
    let gateway: ProductsGateway;

    const product = {
        "name": "Product 1",
        "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis dolorem enim delectus odio doloremque repellat eveniet tempora perferendis repudiandae libero? Minima eligendi earum sed molestiae labore vero deleniti distinctio quia."
    };

    const mockModel = {
        findOne: jest.fn(),
        create: jest.fn(product => ({
            ...product,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    };

    const mockGateway = {
        handleProductCreation: jest.fn(),
        handleProductUpdate: jest.fn(),
        handleProductDelete: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getModelToken(Product.name),
                    useValue: mockModel
                },
                {
                    provide: ProductsGateway,
                    useValue: mockGateway,
                }
            ]
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        model = module.get<Model<Product>>(getModelToken(Product.name));
        gateway = module.get<ProductsGateway>(ProductsGateway);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Create a new product', () => {
        it('should create a new product', async () => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(model, 'create');
            jest.spyOn(gateway, 'handleProductCreation');
            const result = await service.createProduct(product);
            expect(model.findOne).toHaveBeenCalledWith({ name: product.name });
            expect(model.create).toHaveBeenCalledWith(product);
            expect(gateway.handleProductCreation).toHaveBeenCalledWith({ ...product, _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6') });
            expect(result).toEqual({ ...product, _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6') });
        });

        it('should throw an error if the product already exists', async () => {
            const existingProduct = { name: product.name };
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(existingProduct);
            jest.spyOn(model, 'create');
            jest.spyOn(gateway, 'handleProductCreation');
            await expect(service.createProduct(product)).rejects.toThrowError(
                new HttpException('Product already exists', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ name: product.name });
            expect(model.create).not.toHaveBeenCalled();
            expect(gateway.handleProductCreation).not.toHaveBeenCalled();
        });
    });

    it('should return all producs', async () => {
        const products = [{
            "name": "Product 1",
            "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis dolorem enim delectus odio doloremque repellat eveniet tempora perferendis repudiandae libero? Minima eligendi earum sed molestiae labore vero deleniti distinctio quia."
        }];
        jest.spyOn(model, 'find').mockResolvedValueOnce(products);
        const result = await service.getAllProducts();
        expect(model.find).toHaveBeenCalled();
        expect(result).toEqual(products);
    });

    describe('Find by id', () => {

        it('should throw an error if id is missing', async () => {
            const id = null;
            jest.spyOn(model, 'findById')
            await expect(service.getProduct(id)).rejects.toThrowError(new HttpException('Provide product id', HttpStatus.BAD_REQUEST));
            expect(model.findById).not.toHaveBeenCalled();
        });

        it('should get product by id', async () => {
            const id = '64870f92e622309b8eaa38f6';
            jest.spyOn(model, 'findById').mockResolvedValueOnce({ ...product, _id: '"64870f92e622309b8eaa38f6"' })
            const result = await service.getProduct(id);
            expect(result).toEqual({ ...product, _id: '"64870f92e622309b8eaa38f6"' });
        });
    });

    describe('Update the product', () => {
        it('should throw an error if id is missing', async () => {
            const id = null;
            jest.spyOn(model, 'findByIdAndUpdate');
            jest.spyOn(gateway, 'handleProductUpdate');
            await expect(service.deleteProduct(id)).rejects.toThrowError(new HttpException('Provide product id', HttpStatus.BAD_REQUEST));
            expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(gateway.handleProductUpdate).not.toHaveBeenCalled();
        });

        it('should throw an error if the product already exists', async () => {
            const existingProduct = { name: product.name };
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(existingProduct);
            jest.spyOn(model, 'findByIdAndUpdate');
            jest.spyOn(gateway, 'handleProductUpdate');
            await expect(service.createProduct(product)).rejects.toThrowError(
                new HttpException('Product already exists', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ name: product.name });
            expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(gateway.handleProductUpdate).not.toHaveBeenCalled();
        });

        it('should update the product by id', async () => {
            const id = new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6');
            jest.spyOn(model, 'findOne');
            jest.spyOn(model, 'find').mockResolvedValueOnce([product]);
            jest.spyOn(gateway, 'handleProductUpdate');
            jest.spyOn(model, 'findByIdAndUpdate')
            const result = await service.updateProduct({...product, _id: id});
            expect(result).toEqual([product]);
            expect(model.find).toHaveBeenCalled();
            expect(model.findOne).toHaveBeenCalledWith({name: product.name});
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(id, {...product, _id: id});
            expect(gateway.handleProductUpdate).toHaveBeenCalledWith([product], id);
        });
    });

    describe('Delete the product', () => {
        it('should throw an error if id is missing', async () => {
            const id = null;
            jest.spyOn(model, 'findById')
            await expect(service.deleteProduct(id)).rejects.toThrowError(new HttpException('Provide product id', HttpStatus.BAD_REQUEST));
            expect(model.findById).not.toHaveBeenCalled();
        });

        it('should delete the product by id', async () => {
            const id = '64870f92e622309b8eaa38f6';
            jest.spyOn(model, 'findOne').mockResolvedValueOnce({ ...product, _id: '64870f92e622309b8eaa38f6' });
            jest.spyOn(model, 'find').mockResolvedValueOnce([product]);
            jest.spyOn(gateway, 'handleProductDelete');
            jest.spyOn(model, 'findByIdAndDelete')
            const result = await service.deleteProduct(id);
            expect(result).toEqual([product]);
            expect(model.find).toHaveBeenCalled();
            expect(model.findOne).toHaveBeenCalledWith({_id: id});
            expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(gateway.handleProductDelete).toHaveBeenCalledWith([product], product.name);
        });
    });

});