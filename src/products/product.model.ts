import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductData = HydratedDocument<Product>;

@Schema()
export class Product {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);