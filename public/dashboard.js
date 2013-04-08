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

    // Toggle the `done` state of this todo item.
    // toggle: function() {
      // this.save({done: !this.get("done")});
    // }

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

    // Filter down the list of all todo items that are finished.
    // done: function() {
      // return this.where({done: true});
    // },

    // Filter down the list to only todo items that are still not finished.
    // remaining: function() {
      // return this.without.apply(this, this.done());
    // },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    // nextOrder: function() {
      // if (!this.length) return 1;
      // return this.last().get('order') + 1;
    // },

    // Todos are sorted by their original insertion order.
    // comparator: 'order'

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
      "dblclick span"    : "edit",
      // "click span"       : "selectItem",
      'mouseenter': 'selectItem',
      'mouseleave': 'deselectItem',
      "click a.edit"     : "edit",
      "click a.destroy"  : "clear",
      "keypress .edit"   : "updateOnEnter",
      "click a.btn.done" : "close",
      // "blur .edit"      : "close",
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

      // close marker window if open when removing
      this.model.on("remove", this.close, this);

    },

    // Re-render the titles of the todo item.
    render: function() {
      // console.log("rendering locationView")
      this.$el.html(this.template(this.model.toJSON()));
      // this.$el.toggleClass('done', this.model.get('done'));
      // this.input = this.$('.edit');
      this.location_title = this.$('.edit.location-title');
      this.location_address = this.$('.edit.location-address');

      return this;
    },

    // Toggle the `"done"` state of the model.
    // toggleDone: function() {
      // this.model.toggle();
    // },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.$("a.btn.done").css('display', 'inline-block');
      this.$("a.btn.edit").css('display', 'none');
      // this.location_title.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
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
      // "keypress #new-todo":  "createOnEnter",
      // "click #clear-completed": "clearCompleted",
      // "click #toggle-all": "toggleAllComplete",
      "click a.new-location": "create",
      "keypress input"      : "createOnEnter",
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      // this.input = this.$("#new-todo");
      this.location_address = this.$('#new-location-address');
      this.location_title    = this.$('#new-location-title');

      // this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Locations, 'add',   this.addOne);
      this.listenTo(Locations, 'reset', this.addAll);
      this.listenTo(Locations, 'all',   this.render);
      // this.listenTo(Locations, 'refresh', this.addAll);

      // this.footer = this.$('footer');
      // this.main = $('#main');

      Locations.fetch({ update: true, success:this.fetchSuccessCallback() });
    },

    fetchSuccessCallback: function() {
      // console.log("fetch success");
      // console.log(_(Locations.models).clone());
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      // console.log("rendering appView");
      // var done = Locations.done().length;
      // var remaining = Locations.remaining().length;

      // if (Locations.length) {
        // this.main.show();
        // this.footer.show();
        //this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      // } else {
        // this.main.hide();
        // this.footer.hide();
      // }

      // this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
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
      // get name and address data
      var location_address = this.location_address.val();
      var location_title = this.location_title.val();
      // validate that data exists
      if (!location_address || !location_title) {
        // no data
      } else {
        // create a new model
        Locations.create({ title: location_title, address: location_address }, { success: this.createSuccessCallback() });
        // clear the inputs
        this.location_title.val('');
        this.location_address.val('');
      }
    },

    createSuccessCallback: function() {
      console.log("added a new loc");
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      // _.invoke(Locations.done(), 'destroy');
      // return false;
    },

    toggleAllComplete: function () {
      // var done = this.allCheckbox.checked;
      // Locations.each(function (todo) { todo.save({'done': done}); });
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

  App.init = function() {

    this.createMap();

    this.places = Locations;

    // Render Markers
    var markerCollectionView = new this.MarkerCollectionView({
      collection: this.places,
      map: this.map
    });
    markerCollectionView.render();

    // Render ListView
    var listView = new App.ListView({
      collection: this.places
    });
    listView.render();
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

    // find bars
    $('#bars').click(function() {
      App.places.reset(bars);
    });

    // find museums
    $('#museums').click(function() {
      App.places.reset(museums);
    });

    // add one sample location to map and list view
    $('#addBtn').click(function() {
      App.places.add({
        title: 'State Capitol Building',
        lat: 44.9543075,
        lng: -93.102222
      });
    });

    $('#removeBtn').click(function() {
      App.places.remove(App.places.at(0));
    });
  });


});
