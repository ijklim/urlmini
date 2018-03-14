module.exports = function(req) {
  let urlMappings = [];

  this.generateUrl = (urlToShorten) => {
    if (urlToShorten.length === 0) return { error: 'Url missing' }
    if (!urlToShorten.match(/^http[s]?\:\/\//)) return { error: 'Invalid url' }

    urlMappings.push(urlToShorten);

    return {
      original_url: urlToShorten,
      short_url: 'http' + (req.secure ? 's' : '') + '://' + req.hostname + '/' + (urlMappings.length - 1)
    }
  }

  this.getOriginalUrl = (id) => {
    if (urlMappings[id]) return { original_url: urlMappings[id] };
    return { error: 'Url is not in the databases' };
  }
}