var request = require('superagent');

/**
 * Client for Webfinger protocol (RFC 7033)
 *
 * @see http://tools.ietf.org/html/rfc7033
 */
function WebfingerResolver() {
  
}

/**
 * Resolves a URI via Webfinger.
 *
 * This will query a URI via Webfinger and return a set of link relations as a
 * JRD document.
 *
 * Supported protocols:
 *
 * * acct:
 * * ripple:
 *
 * @param {String} uri Uniform Resource Identifier that we want to discover
 *   links for.
 * @param {String} hostname Explicitly set hostname for lookup (optional for
 *   acct: protocol)
 * @returns {Object} JSON Resource Descriptor (JRD) as JavaScript object
 */
WebfingerResolver.resolve = function (uri, hostname, callback) {
  // Hostname parameter is optional
  if ("function" === typeof hostname) {
    callback = hostname;
    hostname = void(0);
  }
  
  // Parse URI scheme
  var scheme = uri.split(':')[0];
  
  // Certain schemes can auto-detect the hostname
  if (!hostname && scheme === 'acct') {
    hostname = uri.split(':')[1].split('@')[1];
  } else if (!hostname) {
    throw new Error("Missing required parameter 'hostname'");
  }
  
  // Construct query URL
  var queryUrl = "https://"+hostname+"/.well-known/webfinger?resource="+encodeURIComponent(uri);
  
  // Make HTTP request
  request.get(queryUrl, function(err, resp) {
    if (err) {
      callback(err);
      return;
    }

    // Attempt to parse response
    var resourceDescriptorObj;
    try {
      resourceDescriptorObj = JSON.parse(resp.text);
    } catch(err) {
      callback(err);
      return;
    }
    
    // Done, seems to have worked
    callback(err, resourceDescriptorObj);
  });
};

exports.WebfingerResolver = WebfingerResolver;