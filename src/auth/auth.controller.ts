import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../users/entities/user.entity';
import { ApiResponse, type IApiResponse } from '../utils/api-response.util';
import { UseRoles } from '../utils/roles.decorator';
import { RolesGuard } from '../utils/roles.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email, password, and role',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid registration data',
  })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<IApiResponse<AuthResponseDto>> {
    const result = await this.authService.register(registerDto);
    return ApiResponse.created<AuthResponseDto>({
      data: result,
      message: 'User registered successfully',
      statusCode: 201,
      path: '/auth/register',
    });
  }

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<IApiResponse<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return ApiResponse.success<AuthResponseDto>({
      data: result,
      message: 'User logged in successfully',
      statusCode: 200,
      path: '/auth/login',
    });
  }

  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Get current user profile information (requires authentication)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  // GET request can be accessed by all roles
  @UseRoles(UserRole.DOCTOR, UserRole.LAB, UserRole.PATIENT)
  @Get('profile')
  getProfile(@Request() req: { user: any }): IApiResponse<UserDto> {
    return ApiResponse.success<UserDto>({
      data: req.user as UserDto,
      message: 'User profile retrieved successfully',
      statusCode: 200,
      path: '/auth/profile',
    });
  }
}
