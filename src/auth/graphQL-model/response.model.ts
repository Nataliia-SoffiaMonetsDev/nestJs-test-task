import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Response {
    @Field()
    readonly acknowledged: boolean

    @Field()
    readonly deletedCount: number
}