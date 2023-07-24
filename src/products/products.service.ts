import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { ProductDto } from './dto/product.dto';
import { ProductsGateway } from './products.gateway';
import { ProductInput } from './graphQL-model/input-fields.model';
import * as mongoose from 'mongoose';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        private readonly productsGateway: ProductsGateway,
    ) { }

    async createProduct(product: ProductDto): Promise<ProductDto> {
        const existingProduct = await this.productModel.findOne({name: product.name});
        if (existingProduct) {
            throw new HttpException('Product already exists', HttpStatus.BAD_REQUEST);
        }
        const createdProduct = await this.productModel.create(product);
        this.productsGateway.handleProductCreation(createdProduct);
        return createdProduct;
    }

    async getAllProducts(): Promise<ProductDto[]> {
        const products = await this.productModel.find();
        return products;
    }

    async getProduct(id: string): Promise<ProductDto> {
        if (!id) {
            throw new HttpException('Provide product id', HttpStatus.BAD_REQUEST);
        }
        const product = await this.productModel.findById(id);
        return product;
    }

    async updateProduct(product: ProductInput): Promise<ProductDto[]> {
        if (!product._id) {
            throw new HttpException('Provide product id', HttpStatus.BAD_REQUEST);
        }
        const existingProduct = await this.productModel.findOne({name: product.name});
        const id = new mongoose.Types.ObjectId(product._id);
        if (existingProduct && (existingProduct._id != id)) {
            throw new HttpException('Product already exists', HttpStatus.BAD_REQUEST);
        }
        await this.productModel.findByIdAndUpdate(product._id, product);
        const updatedProducts = await this.productModel.find();
        this.productsGateway.handleProductUpdate(updatedProducts, id);
        return updatedProducts;
    }

    async deleteProduct(id: string): Promise<ProductDto[]> {
        if (!id) {
            throw new HttpException('Provide product id', HttpStatus.BAD_REQUEST);
        }
        const product = await this.productModel.findOne({_id: id});
        await this.productModel.findByIdAndDelete(id);
        const products = await this.productModel.find();
        this.productsGateway.handleProductDelete(products, product.name);
        return products;
    }
}
