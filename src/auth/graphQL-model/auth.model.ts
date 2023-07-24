import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserAuth {
    @Field()
    readonly email: string;

    @Field()
    readonly userName?: string;

    @Field()
    readonly password: string;

    @Field()
    readonly token?: string;
}