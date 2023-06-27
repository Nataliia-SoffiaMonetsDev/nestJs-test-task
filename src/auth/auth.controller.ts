import { Body, Controller, Post, Headers, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { LogoutResponse } from 'src/shared/interfaces/response.interface';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('registration')
    register(@Body() body: UserDto): Promise<UserDto> {
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: UserDto): Promise<UserDto> {
        return this.authService.login(body);
    }

    @Post('logout')
    logout(@Headers() headers: { authorization: string }): Promise<LogoutResponse> {
        return this.authService.logout(headers.authorization);
    }

    @Get('users')
    getUsers(): Promise<UserDto[]> {
        return this.authService.getUsers();
    }
}
