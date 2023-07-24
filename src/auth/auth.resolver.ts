import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserAuth } from './graphQL-model/auth.model';
import { UserDto } from './dto/user.dto';
import { LogoutResponse } from 'src/shared/interfaces/response.interface';
import { Response } from './graphQL-model/response.model';

@Resolver(() => UserAuth)
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => UserAuth)
    async register(@Args('user') user: UserDto): Promise<UserDto> {
        return this.authService.register(user);
    }

    @Mutation(() => UserAuth)
    async login(@Args('user') user: UserDto): Promise<UserDto> {
        return this.authService.login(user);
    }

    @Mutation(() => Response)
    async logout(@Context() context): Promise<LogoutResponse> {
        const authHeader = context.req.headers.authorization;
        return this.authService.logout(authHeader);
    }

    @Query(() => [UserAuth])
    async getUsers(): Promise<UserDto[]> {
        return this.authService.getUsers();
    }
}