import Ember from 'ember';
import config from '../config/environment';

export default Ember.Component.extend({
  init: function() {
    this._super.apply(this, arguments);

    if (!this.get('upload-preset'))
      throw new Error('upload-preset attribute missing.');
  },

  classNames: ['relative', 'clearfix', 'image-upload-target'],
  classNameBindings: ['isDraggingOver:active'],

  cloudName: config.cloudinary.cloudName,

  // API - START

  'upload-preset': '',
  multiple: false, // cloudinary doesn't support multiple uploads. it will return the second image uploaded

  // API - END

  _ignoreNextLeave: false,
  uploading: false,
  progressPercent: 0,
  uploadError: null,
  isDraggingOver: false,

  dragEnter: function(e) {
    // dragEnter and dragLeave logic inspired by http://stackoverflow.com/a/20976009/188740
    if (e.target !== this.element) {
      this.set('_ignoreNextLeave', true);
    }

    this.set('isDraggingOver', true);
  },

  dragLeave: function(e) {
    if (this.get('_ignoreNextLeave')) {
      this.set('_ignoreNextLeave', false);
      return;
    }

    this.set('isDraggingOver', false);
  },

  dragOver: function(e) {
    e.preventDefault();
  },

  drop: function(e) {
    e.preventDefault();
    this.upload(e.dataTransfer.files);
  },

  change: function(e) {
    if (e.target.tagName !== 'INPUT')
      return;

    if (e.target.getAttribute('type') !== 'file')
      return;

    this.upload(e.target.files);
  },

  upload: function(files) {

    this.setProperties({
      isDraggingOver: false,
      uploading: true,
      progressPercent: 0,
      uploadError: null
    });

    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
      formData.append('file', files[i]);

      if (!this.get('multiple'))
        break;
    }

    formData.append("upload_preset", this.get('upload-preset'));

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + this.get('cloudName') + '/image/upload');

    xhr.upload.addEventListener('progress', this.progress.bind(this), false);
    xhr.addEventListener('load', this.load.bind(this), false);
    xhr.addEventListener('error', this.error.bind(this), false);
    xhr.addEventListener('abort', this.abort.bind(this), false);

    xhr.send(formData);
  },

  progress: function(e) {
    if (!e.lengthComputable)
      return;

    var percent = Math.round(e.loaded * 100 / e.total);
    this.set('progressPercent', percent);
  },

  load: function(e) {
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

  error: function(e) {

    this.setProperties({
      uploading: false,
      progressPercent: 0,
      uploadError: 'There was an unexpected upload error.'
    });

  },

  abort: function(e) {
    this.setProperties({
      uploading: false,
      progressPercent: 0,
      uploadError: 'Upload was aborted.'
    });
  }
});
