import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should authenticate a producer and persist the session', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'test-token',
            user: {
              id: 1,
              name: 'Cooperative Mont Manengouba',
              email: 'ouest@marketdouala.cm',
              city: 'Dschang',
              role: 'producer',
            },
          }),
      }),
    ) as jest.Mock;

    const producer = await service.login('ouest@marketdouala.cm', 'password123');

    expect(producer.name).toBe('Cooperative Mont Manengouba');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe('test-token');
    expect(localStorage.getItem('producer-session')).toContain('Cooperative Mont Manengouba');
  });
});
