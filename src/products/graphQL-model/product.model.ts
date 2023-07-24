import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductData {
    @Field()
    readonly name: string;

    @Field()
    readonly description: string;

    @Field()
    readonly _id: string;
}