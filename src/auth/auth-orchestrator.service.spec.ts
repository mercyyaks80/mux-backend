import { BadRequestException } from '@nestjs/common';
import {
  AuthOrchestratorService,
  AuthPayloadValidator,
} from './auth-orchestrator.service';

describe('AuthPayloadValidator.validate', () => {
  it('rejects a missing authId', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authProvider: 'CLERK' } as any),
    ).toThrow(BadRequestException);
  });

  it('rejects a null authId', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authId: null, authProvider: 'CLERK' } as any),
    ).toThrow(BadRequestException);
  });

  it('rejects a non-string authId object', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authId: { $ne: null }, authProvider: 'CLERK' } as any),
    ).toThrow(BadRequestException);
  });

  it('rejects a non-string authId number', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authId: 12345, authProvider: 'CLERK' } as any),
    ).toThrow(BadRequestException);
  });

  it('rejects a whitespace-only authId', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authId: '   ', authProvider: 'CLERK' } as any),
    ).toThrow(BadRequestException);
  });

  it('accepts a valid string authId', () => {
    expect(() =>
      AuthPayloadValidator.validate({ authId: 'user_abc', authProvider: 'CLERK' } as any),
    ).not.toThrow();
  });
});

describe('AuthOrchestratorService.validatePayload', () => {
  const service = new AuthOrchestratorService();

  it('returns false for rejected payloads', () => {
    expect(service.validatePayload({ authId: { $ne: null }, authProvider: 'CLERK' } as any)).toBe(false);
    expect(service.validatePayload({ authId: '   ', authProvider: 'CLERK' } as any)).toBe(false);
    expect(service.validatePayload({ authId: 12345, authProvider: 'CLERK' } as any)).toBe(false);
  });

  it('returns true for a valid payload', () => {
    expect(service.validatePayload({ authId: 'user_abc', authProvider: 'CLERK' } as any)).toBe(true);
  });
});
