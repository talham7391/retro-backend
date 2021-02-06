import request from 'supertest';
import app from '../app/app';

describe('health check', () => {
  beforeEach(() => {
    app.listen(3000);
  });

  afterEach(() => {
    app.close();
  });

  it('returns 200 to /', (done) => {
    request(app).get('/').expect(200, done);
  });
});
