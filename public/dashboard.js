// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Location Model
  // ----------

  // Our basic **Location** model has `long`, `lat`, `address`, and `name` attributes.
  var Location = Backbone.GoogleMaps.Location.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        lng: 0.0,
        lat: 0.0,
        address: "123 Pleasant St",
        title: "Pleasantville"
      };
    },
  });

  // Location Collection
  // ---------------

  // The collection of loctions is backed by postgres
  var LocationList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Location,

    // Save all of the locations under the `"locations"` namespace.
    // localStorage: new Backbone.LocalStorage("todos-backbone"),
    url: '/locations'
  });

  // Create our global collection of **Locations**.
  var Locations = new LocationList;

  // Location Item View
  // --------------

  // The DOM element for a location...
  var LocationView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single location.
    template: _.template($('#location-template').html()),

    // The DOM events specific to a location.
    events: {
      // "click span"       : "selectItem",
      'click a.map'      : 'toggleSelect',
      // 'mouseleave'       : 'deselectItem',
      "dblclick span"    : "edit",
      "click a.edit"     : "edit",
      "click a.destroy"  : "clear",
      "keypress .edit"   : "updateOnEnter",
      "click a.btn.done" : "close",
      // "blur .edit"      : "close",
    },

    toggleSelect: function() {
      this.model.toggleSelect();
    },

    selectItem: function() {
      this.model.select();
    },

    deselectItem: function() {
      this.model.deselect();
    },

    // The LocationView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Location** and a **LocationView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);

      this.model.on("change:lat change:lng", this.refreshMarkerCollectionView, this);

      // close marker window if open when removing
      this.model.on("remove", this.close, this);
    },

    refreshMarkerCollectionView: function(loc) {
      // we also need to re-render the markers

      // markerCollectionView.render();

      // console.log(markerCollectionView);
      // if(markerCollectionView) App.MarkerCollectionView.refresh();
      // App.MarkerCollectionView.refresh();
      // markerCollectionView.closeChildren();
      // if(loc.selected == true) {
        // markerCollectionView.addChild(loc);
      // }
      // } else {
        // markerCollectionView.closeChild(loc);
      // }
      console.log(loc);
      // markerCollectionView.closeChildren();
      // markerCollectionView.addChild(loc);
      // markerCollectionView.refresh();

      // Locations.reset();
      // markerCollectionView.closeChildren();
      // markerCollectionView.render();
      console.log(App.MarkerView);

      // Render Markers
      var markerCollectionView = new Backbone.GoogleMaps.MarkerCollectionView({
          collection: Locations,
          map: App.map
      });
      markerCollectionView.render();
    },

    // Re-render the titles of the todo item.
    render: function() {
      // console.log("rendering locationView")
      this.$el.html(this.template(this.model.toJSON()));
      // this.$el.toggleClass('done', this.model.get('done'));
      // this.input = this.$('.edit');
      this.location_title   = this.$('.edit.location-title');
      this.location_address = this.$('.edit.location-address');

      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.$("a.btn.done").css('display', 'inline-block');
      this.$("a.btn.edit").css('display', 'none');
      // this.location_title.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      // this.deselect();
      var location_title = this.location_title.val();
      var location_address = this.location_address.val();
      if (!location_title || !location_address) {
        this.clear();
      } else {
        this.model.save({title: location_title, address: location_address});
        this.$el.removeClass("editing");
        this.$("a.btn.done").css('display', 'none');
        this.$("a.btn.edit").css('display', 'inline-block');
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    },

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("div.container"),

    // Our template for the line of statistics at the bottom of the app.
    // statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click a.new-location": "create",
      "keypress input"      : "createOnEnter",
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
      this.location_address = this.$('#new-location-address');
      this.location_title    = this.$('#new-location-title');

      this.listenTo(Locations, 'add',   this.addOne);
      this.listenTo(Locations, 'reset', this.addAll);
      this.listenTo(Locations, 'all',   this.render);

      Locations.fetch({ update: true, success: this.fetchSuccessCallback() });
    },

    fetchSuccessCallback: function() {
      // console.log("fetch success");
      // console.log(_(Locations.models).clone());
    },

    // Re-rendering the App.  we don't have anything to do here yet.
    render: function() {

    },

    // Add a single location to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(location) {
      var view = new LocationView({model: location});
      this.$("#favorite-locations").append(view.render().el);
    },

    // Add all items in the **Locations** collection at once.
    addAll: function() {
      console.log("addAll");
      $("#location-template").empty();
      Locations.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Location** model,
    // persisting it to *db*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.location_address.val() || !this.location_title.val()) return;

      this.create();
    },

    create: function() {
      // get title and address data
      var location_address = this.location_address.val();
      var location_title = this.location_title.val();
      // validate that data exists
      if (!location_address || !location_title) {
        // no data
      } else {
        // create a new model
        var loc = Locations.create({ title: location_title, address: location_address }, { success: this.createSuccessCallback() });

        // clear the inputs
        this.location_title.val('');
        this.location_address.val('');
      }
    },

    createSuccessCallback: function() {
      console.log("added a new location");

    }
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;


  // Googlemaps.backbone
  // ---------------

  // marker's info window
  App.InfoWindow = Backbone.GoogleMaps.InfoWindow.extend({
    template: '#infoWindow-template',

    events: {
      'mouseenter h4': 'logTest'
    },

    logTest: function() {
      console.log('test in InfoWindow');
    }
  });

  // marker itself (click+draggable)
  App.MarkerView = Backbone.GoogleMaps.MarkerView.extend({
    infoWindow: App.InfoWindow,

    overlayOptions: {
      draggable: true
    },

    initialize: function() {
      _.bindAll(this, 'handleDragEnd');
    },

    mapEvents: {
      'dragend' : 'handleDragEnd'
    },

    handleDragEnd: function(e) {
      // see where user dropped marker
      alert('Dropped at: \n Lat: ' + e.latLng.lat() + '\n lng: ' + e.latLng.lng());
    }
  });

  // collection of markerviews across the map (click+draggable)
  App.MarkerCollectionView = Backbone.GoogleMaps.MarkerCollectionView.extend({
    markerView: App.MarkerView
  });

  var markerCollectionView;
  App.init = function() {

    this.createMap();

    this.places = Locations;

    // Render Markers
    markerCollectionView = new this.MarkerCollectionView({
      collection: this.places,
      map: this.map
    });
    markerCollectionView.render();

  }

  App.createMap = function() {
    var mapOptions = {
      center: new google.maps.LatLng(37.7611615, -122.4368426),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    // Instantiate map
    this.map = new google.maps.Map($('#map_canvas')[0], mapOptions);
  }

  $(document).ready(function() {
    App.init();

    // add one sample location to map and list view
    $('#addBtn').click(function() {
      // console.log(App.places);
      Locations.add([{
        title: 'Example',
        lat: 37.7714695,
        lng: -122.4368426,
        address: "500 haight st sf ca"
      }]);
    });
  });


});
