import Ember from 'ember';
const {
  Handlebars,
  Helper
} = Ember;
const { helper } = Helper;
const { SafeString } = Handlebars;

let attributeNames = ['class'];
export function imageTransform(params, hash) {
  let attributes = [];
  attributeNames.forEach( (attributeName)=> {
    if (hash[attributeName]) {
      attributes.push(`${attributeName}="${hash[attributeName]}"`);
    }
  });

  if (hash.url) {
    let transformers = [];

    if (hash.crop) {
      transformers.push('c_' + hash.crop);
    } else {
      transformers.push('c_fit');
    }

    if (hash.gravity) {
      transformers.push('g_' + hash.gravity);
    }

    if (hash.radius) {
      transformers.push('r_' + hash.radius);
    }

    if (hash.width) {
      transformers.push('w_' + hash.width);
    }

    if (hash.height) {
      transformers.push('h_' + hash.height);
    }

    let url = hash.url.replace('/image/upload/', '/image/upload/' + transformers.join(',') + '/');

    return new SafeString(`<img src="${url}" ${attributes.join(' ')} />`);
  }

  let dimensions = [];

  if (hash.width) {
    dimensions.push(hash.width);
  }

  if (hash.height) {
    dimensions.push(hash.height);
  }

  hash.placeholder = hash.placeholder || '%20';

  return new SafeString(`<img src="https://placehold.it/${dimensions.join('x')}&text=${hash.placeholder}" ${attributes.join(' ')} />`);
}

export default helper(imageTransform);
