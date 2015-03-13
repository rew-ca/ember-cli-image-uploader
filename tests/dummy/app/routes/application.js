import Ember from 'ember';

export default Ember.Route.extend({

    model: function() {
        return Ember.Object.create({
            imageUrl: null
        });
    },

    actions: {

        replaceImage: function(imageUrls) {
            this.modelFor(this.routeName).set('imageUrl', imageUrls[0]);
        }

    }

});