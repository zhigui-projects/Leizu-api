'use strict';

require('should');
const app = require('../src/index');
const server = app.listen(8080);
const request = require('supertest').agent(server);

describe('Application Tests', function() {
  after(function() {
    server.close();
  });
  it('GET request', function(done) {
    request
    .get('/')
    .expect(200)
    .expect('[]', done);
  });
});