var assert = require('assert'),
    nock = require('nock'),
    WebfingerResolver = require('../src/js/ripple/webfingerresolver').WebfingerResolver;


describe('WebfingerResolver#resolve', function() {
  var mockHttp;
  before(function () {
    // Mock Webfinger endpoint
    nock.disableNetConnect();
    mockHttp = nock('https://acme.com');
    mockHttp.get('/.well-known/webfinger?resource=acct%3Abob%40acme.com')
      .reply(200, {
        "subject": "acct:bob@acme.com"
      });
    
    mockHttp.get('/.well-known/webfinger?resource=ripple%3Ainvalidjson')
      .reply(200, '{"test": {');
  });

  it('should correctly resolve acct:bob@acme.com', function(done) {
    WebfingerResolver.resolve('acct:bob@acme.com', function (err, result) {
      assert.ifError(err);
      assert.deepEqual(result, {
        "subject": "acct:bob@acme.com"
      });
      done();
    });
  });
  
  it('should throw if the hostname is omitted for ripple:bob', function(done) {
    assert.throws(function () {
      WebfingerResolver.resolve('ripple:bob', function (err, result) {
        assert();
      });
    });
    done();
  });
  
  it('should return an error object if the server sends invalid json', function(done) {
    WebfingerResolver.resolve('ripple:invalidjson', 'acme.com', function (err, result) {
      assert(err);
      done();
    });
  });

  after(function () {
    mockHttp.done();
    nock.enableNetConnect();
  });
});
