import Ember from 'ember';

export function imageTransform(params, hash) {
    var transformers = ['c_fit'];

    if (hash.width)
        transformers.push('w_' + hash.width);

    if (hash.height)
        transformers.push('h_' + hash.height);

    if (!hash.url)
        throw new Error('url is required.');

    var url = hash.url.replace('/image/upload/', '/image/upload/' + transformers.join(',') + '/');

    return new Ember.Handlebars.SafeString('<img src="' + url + '" />');
}

export default Ember.HTMLBars.makeBoundHelper(imageTransform);
