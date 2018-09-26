require('should');
const app = require('../src/index');
const server = app.listen(app.port);
const request = require('supertest').agent(server);

describe('Application Tests', function() {
  after(function() {
    server.close();
  });

  it('GET request', function(done) {
    request
    .get('/')
    .expect(200)
    .expect('content-type', 'application/json; charset=utf-8')
    .expect('[]', done);
  });
});