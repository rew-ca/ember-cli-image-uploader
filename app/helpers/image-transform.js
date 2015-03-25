import Ember from 'ember';

var attributeNames = ['class'];

export function imageTransform(params, hash) {

    var attributes = [];
    attributeNames.forEach(function(attributeName){
        if (hash[attributeName])
            attributes.push('%@="%@"'.fmt(attributeName, hash[attributeName]));
    }, this);

    if (hash.url) {
        var transformers = ['c_fit'];

        if (hash.width)
            transformers.push('w_' + hash.width);

        if (hash.height)
            transformers.push('h_' + hash.height);

        var url = hash.url.replace('/image/upload/', '/image/upload/' + transformers.join(',') + '/');

        return new Ember.Handlebars.SafeString('<img src="%@" %@ />'.fmt(url, attributes.join(' ')));
    }

    var dimensions = [];

    if (hash.width)
        dimensions.push(hash.width);

    if (hash.height)
        dimensions.push(hash.height);

    hash.placeholder = hash.placeholder || '%20';

    return new Ember.Handlebars.SafeString('<img src="https://placehold.it/%@&text=%@" %@ />'.fmt(dimensions.join('x'), hash.placeholder, attributes.join(' ')));

}

export default Ember.HTMLBars.makeBoundHelper(imageTransform);
