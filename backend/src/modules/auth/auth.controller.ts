import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
} from './dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('payment-settings')
  @ApiOperation({ summary: 'Get registration payment settings' })
  async getPaymentSettings() {
    return this.authService.getRegistrationPaymentSettings();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new member' })
  @AuditAction('auth', 'register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    if ('accessToken' in result && 'refreshToken' in result) {
      this.setCookies(
        res,
        result.accessToken as string,
        result.refreshToken as string,
      );
    }

    return result;
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to email' })
  @AuditAction('auth', 'resend_otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify email with OTP' })
  @AuditAction('auth', 'verify_otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtp(dto);
    const { accessToken, refreshToken } = result;

    if (accessToken && refreshToken) {
      this.setCookies(res, accessToken, refreshToken);
    }
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get tokens via cookies' })
  @AuditAction('auth', 'login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const { accessToken, refreshToken } = result;

    if (accessToken && refreshToken) {
      this.setCookies(res, accessToken, refreshToken);
    }

    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken)
      throw new UnauthorizedException('Refresh token missing');

    const { accessToken, refreshToken } =
      await this.authService.refresh(oldRefreshToken);
    this.setCookies(res, accessToken, refreshToken);

    return { message: 'Token refreshed', accessToken, refreshToken };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookies' })
  @AuditAction('auth', 'logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken;
    await this.authService.logout(refreshToken);

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @AuditAction('auth', 'forgot_password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @AuditAction('auth', 'reset_password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
