import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthProvider, isValidAuthProvider } from './auth-provider.enum';

export interface AuthPayload {
  authId: string;
  authProvider: AuthProvider;
}

export class AuthPayloadValidator {
  /**
   * Fail-closed: invalid or missing claims are rejected.
   */
  static validate(payload: Partial<AuthPayload> | null | undefined): void {
    if (!payload) {
      throw new BadRequestException('Missing auth payload');
    }

    if (payload.authId === undefined || payload.authId === null) {
      throw new BadRequestException('Missing authId');
    }

    if (typeof payload.authId !== 'string') {
      throw new BadRequestException('authId must be a string');
    }

    if (payload.authId.trim() === '') {
      throw new BadRequestException('authId must not be empty');
    }

    if (payload.authProvider === undefined || payload.authProvider === null) {
      throw new BadRequestException('Missing authProvider');
    }

    if (typeof payload.authProvider !== 'string') {
      throw new BadRequestException('authProvider must be a string');
    }

    if (payload.authProvider.trim() === '') {
      throw new BadRequestException('authProvider must not be empty');
    }

    if (!isValidAuthProvider(payload.authProvider)) {
      throw new BadRequestException('Invalid authProvider');
    }
  }
}

@Injectable()
export class AuthOrchestratorService {
  private readonly logger = new Logger(AuthOrchestratorService.name);

  validatePayload(payload: Partial<AuthPayload> | null | undefined): boolean {
    try {
      AuthPayloadValidator.validate(payload);
      return true;
    } catch (error) {
      this.logger.warn(
        `Rejected auth payload: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return false;
    }
  }
}
