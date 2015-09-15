import Ember from 'ember';
import layout from '../templates/components/image-uploader';
const {
  Component,
  computed
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
  uploadError:       null,
  uploading:         false,
  'upload-preset':   '',
  _ignoreNextLeave:  false,

  checkForUploadPreset: function() {
    if (!this.get('upload-preset')) {
      throw new Error('upload-preset attribute missing.');
    }
  }.on('init'),

  setConfig: function(){
    // Current method described as how to get the consuming apps' config.
    // See: http://discuss.emberjs.com/t/best-practices-accessing-app-config-from-addon-code/7006/13
    this.set('config', this.container.lookupFactory('config:environment'));
  }.on('init'),

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

  upload(files) {
    this.setProperties({
      isDraggingOver: false,
      uploading: true,
      progressPercent: 0,
      uploadError: null
    });

    let formData = new FormData();

    for (var i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
      if (!this.get('multiple')) { break; }
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

  progress(e) {
    if (!e.lengthComputable) { return; }
    let percent = Math.round(e.loaded * 100 / e.total);
    this.set('progressPercent', percent);
  },

  load(e) {
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

  error(e) {
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
