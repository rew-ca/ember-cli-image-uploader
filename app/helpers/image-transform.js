import Ember from 'ember';
var attributeNames = ['class'],
    fmt = Ember.String.fmt;

export function imageTransform(params, hash) {
  var attributes = [];

  attributeNames.forEach(function(attributeName) {
    if (hash[attributeName])
      attributes.push(fmt('%@="%@"', attributeName, hash[attributeName]));
  }, this);

  if (hash.url) {
    var transformers = [];

    if (hash.crop)
      transformers.push('c_' + hash.crop);
    else
      transformers.push('c_fit');

    if (hash.gravity)
      transformers.push('g_' + hash.gravity);

    if (hash.radius)
      transformers.push('r_' + hash.radius);

    if (hash.width)
      transformers.push('w_' + hash.width);

    if (hash.height)
      transformers.push('h_' + hash.height);

    var url = hash.url.replace('/image/upload/', '/image/upload/' + transformers.join(',') + '/');

    return new Ember.Handlebars.SafeString(fmt('<img src="%@" %@ />', url, attributes.join(' ')));
  }

  var dimensions = [];

  if (hash.width)
    dimensions.push(hash.width);

  if (hash.height)
    dimensions.push(hash.height);

  hash.placeholder = hash.placeholder || '%20';

  return new Ember.Handlebars.SafeString(fmt('<img src="https://placehold.it/%@&text=%@" %@ />', dimensions.join('x'), hash.placeholder, attributes.join(' ')));
}

export default Ember.HTMLBars.makeBoundHelper(imageTransform);
