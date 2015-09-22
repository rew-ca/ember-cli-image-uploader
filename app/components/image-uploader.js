import Ember from 'ember';
import ajax from 'ic-ajax';
import layout from '../templates/components/image-uploader';
const {
  Component,
  computed,
  on
} = Ember;
const { alias } = computed;

export default Component.extend({
  layout:            layout,
  classNames:        ['relative', 'clearfix', 'image-upload-target'],
  classNameBindings: ['isDraggingOver:active'],

  cloudName:         alias('config.cloudinary.cloudName'),
  config:            null,
  isDraggingOver:    false,
  multiple:          false, // cloudinary doesn't support multiple uploads. it will return the second image uploaded
  progressPercent:   0,
  publicId:          null,
  timestamp:         null,
  signature:         null,
  uploadError:       null,
  uploading:         false,
  uploadPreset:      null,
  _ignoreNextLeave:  false,

  formData(files){
    let formData = new FormData();
    formData.append('public_id', this.get('publicId'));
    formData.append('signature', this.get('signature'));
    formData.append('timestamp', this.get('timestamp'));
    if (this.get('uploadPreset')) {
      formData.append('upload-preset', this.get('uploadPreset'));
    }

    for (var i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
      if (!this.get('multiple')) { break; }
    }
    return formData;
  },

  setConfig: on('init', function(){
    // Current method described as how to get the consuming apps' config.
    // See: http://discuss.emberjs.com/t/best-practices-accessing-app-config-from-addon-code/7006/13
    this.set('config', this.container.lookupFactory('config:environment'));
  }),

  dragEnter(e) {
    // dragEnter and dragLeave logic inspired by http://stackoverflow.com/a/20976009/188740
    if (e.target !== this.element) {
      this.set('_ignoreNextLeave', true);
    }

    this.set('isDraggingOver', true);
  },

  dragLeave(e) {
    if (this.get('_ignoreNextLeave')) {
      this.set('_ignoreNextLeave', false);
      return;
    }

    this.set('isDraggingOver', false);
  },

  dragOver(e) {
    e.preventDefault();
  },

  drop(e) {
    e.preventDefault();
    this.upload(e.dataTransfer.files);
  },

  change(e) {
    let isNotInput = e.target.tagName !== 'INPUT';
    let isNotFile = e.target.getAttribute('type') !== 'file';
    if (isNotInput || isNotFile) { return; }
    this.upload(e.target.files);
  },

  ajaxOptions(files){
    return {
      type: 'POST',
      url: 'https://api.cloudinary.com/v1_1/' + this.get('cloudName') + '/image/upload',
      contentType: 'application/json',
      data: this.formData(files)
    };
  },

  upload(files) {
    this.setProperties({
      isDraggingOver: false,
      uploading: true,
      progressPercent: 0,
      uploadError: null
    });

    var xhr = new XMLHttpRequest();//FIXME: Why this, and not ic-ajax or something?
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + this.get('cloudName') + '/image/upload');

    xhr.upload.addEventListener('progress', this.progress.bind(this), false);
    xhr.addEventListener('load', this.handleSuccess.bind(this), false);
    xhr.addEventListener('error', this.handleError.bind(this), false);
    xhr.addEventListener('abort', this.abort.bind(this), false);

    xhr.send(this.formData(files));
  },

  progress(e) {
    if (!e.lengthComputable) { return; }
    let percent = Math.round(e.loaded * 100 / e.total);
    this.set('progressPercent', percent);
  },

  handleSuccess(e) {
    var response = JSON.parse(e.target.responseText);

    if (e.target.status !== 200 && e.target.status !== 201) {
      this.setProperties({
        uploading: false,
        progressPercent: 0,
        uploadError: response.error.message
      });
      return;
    }

    this.setProperties({
      uploading: false,
      progressPercent: 100,
      uploadError: null
    });

    this.sendAction('action', [response.secure_url]);
  },

  handleError(e) {
    this.setProperties({
      uploading: false,
      progressPercent: 0,
      uploadError: 'There was an unexpected upload error.'
    });
  },

  abort(e) {
    this.setProperties({
      uploading: false,
      progressPercent: 0,
      uploadError: 'Upload was aborted.'
    });
  }
});
