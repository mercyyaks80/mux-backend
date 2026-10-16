import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { IdempotentUserService } from '../src/users/idempotent-user.service';

describe('UsersController findOrCreate (e2e)', () => {
  let app: INestApplication;
  let usersService: { findOrCreateUser: jest.Mock };
  let idempotentUserService: { findOrCreateUser: jest.Mock };

  beforeEach(async () => {
    usersService = { findOrCreateUser: jest.fn() };
    idempotentUserService = { findOrCreateUser: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: IdempotentUserService, useValue: idempotentUserService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects the request when the API key has no developer and does not create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/find-or-create')
      .send({ email: 'no-developer@example.com' });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(usersService.findOrCreateUser).not.toHaveBeenCalled();
    expect(idempotentUserService.findOrCreateUser).not.toHaveBeenCalled();
  });

  it('creates the user when the API key resolves to a developer', async () => {
    const created = { id: 'user-1', email: 'valid@example.com' };
    usersService.findOrCreateUser.mockResolvedValue(created);
    idempotentUserService.findOrCreateUser.mockResolvedValue(created);

    const response = await request(app.getHttpServer())
      .post('/users/find-or-create')
      .set('x-api-key', 'valid-key')
      .send({ email: 'valid@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(created);
  });
});
