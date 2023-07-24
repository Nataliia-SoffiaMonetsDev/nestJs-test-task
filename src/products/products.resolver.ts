import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductData } from './graphQL-model/product.model';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { ProductInput } from './graphQL-model/input-fields.model';

@Resolver(() => ProductData)
export class ProductResolver {
    constructor(private productsService: ProductsService) { }

    @Mutation(() => ProductData)
    async createProduct(@Args('product') product: ProductDto): Promise<ProductDto> {
        return this.productsService.createProduct(product);
    }

    @Mutation(() => [ProductData])
    async updateProduct(@Args('product') product: ProductInput): Promise<ProductDto[]> {
        return this.productsService.updateProduct(product);
    }

    @Mutation(() => [ProductData])
    async deleteProduct(@Args('id') id: string): Promise<ProductDto[]> {
        return this.productsService.deleteProduct(id);
    }

    @Query(() => [ProductData])
    async getAllProducts(): Promise<ProductDto[]> {
        return this.productsService.getAllProducts();
    }

    @Query(() => ProductData)
    async getProduct(@Args('id') id: string): Promise<ProductDto> {
        return this.productsService.getProduct(id);
    }
}