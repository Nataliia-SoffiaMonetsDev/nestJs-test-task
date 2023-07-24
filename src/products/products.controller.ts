import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { ProductInput } from './graphQL-model/input-fields.model';

@Controller()
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Post('products')
    createProduct(@Body() body: ProductDto): Promise<ProductDto> {
        return this.productsService.createProduct(body);
    }

    @Get('products')
    getAllProducts(): Promise<ProductDto[]> {
        return this.productsService.getAllProducts();
    }

    @Get('products/:id')
    getProduct(@Param('id') id: string): Promise<ProductDto> {
        return this.productsService.getProduct(id);
    }

    @Put('products')
    updateProduct(@Body() body: ProductInput): Promise<ProductDto[]> {
        return this.productsService.updateProduct(body);
    }

    @Delete('products/:id')
    deleteProduct(@Param('id') id: string): Promise<ProductDto[]> {
        return this.productsService.deleteProduct(id);
    }
}
