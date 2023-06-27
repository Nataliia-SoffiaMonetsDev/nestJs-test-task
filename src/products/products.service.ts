import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

    async createProduct(product: ProductDto): Promise<ProductDto> {
        const existingProduct = await this.productModel.findOne({name: product.name});
        if (existingProduct) {
            throw new HttpException('Product already exists', HttpStatus.BAD_REQUEST);
        }
        const createdProduct = await this.productModel.create(product);
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

    async updateProduct(product: ProductDto): Promise<ProductDto[]> {
        if (!product._id) {
            throw new HttpException('Provide product id', HttpStatus.BAD_REQUEST);
        }
        const existingProduct = await this.productModel.findOne({name: product.name});
        if (existingProduct && (existingProduct._id != product._id)) {
            throw new HttpException('Product already exists', HttpStatus.BAD_REQUEST);
        }
        await this.productModel.findByIdAndUpdate(product._id, product);
        const updatedProducts = await this.productModel.find();
        return updatedProducts;
    }

    async deleteProduct(id: string): Promise<ProductDto[]> {
        if (!id) {
            throw new HttpException('Provide product id', HttpStatus.BAD_REQUEST);
        }
        await this.productModel.findByIdAndDelete(id);
        const products = await this.productModel.find();
        return products;
    }
}
