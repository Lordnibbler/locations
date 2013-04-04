// Here is our Backbone model!
Location = Backbone.Model.extend({
  urlRoot: '/location'
});

$(function() {
  do_create();
});

function do_create() {
  echo("<h3>Creating a location:</h3>");

  var location = new Location;
  location.set({ name: "Test location", address: "902 Haight St, San Francisco CA 94117" });
  location.save({}, {
    error: onerror,
    success: function() {
      print_location(location);
      echo("<h3>Retrieving the same location:</h3>");
      do_retrieve(location);
    }
  });
}

function do_retrieve(_location) {
  var location = new Location({ id: _location.id });
  location.fetch({
    error: onerror,
    success: function() {
      print_location(location);
      do_edit_error(location);
    }
  });
}

function do_edit_error(location) {
  echo("<h3>Editing location with an error:</h3>");
  console.log("(You should see an HTTP error right about here:)");
  location.set({ name: '' });
  location.save({}, {
    success: onerror,
    error: function() {
      console.log("(...yep.)");
      echo("...yes, it occured.");
      do_edit(location);
    }
  });
}

function do_edit(location) {
  echo("<h3>Editing location:</h3>");
  location.set({ name: 'Test location 2', address: '3224 23rd St' });
  location.save({}, {
    error: onerror,
    success: function() {
      print_location(location);
      // do_delete(location);
      //do_success();
    }
  });
}

function do_delete(location) {
  echo("<h3>Deleting location:</h3>");
  location.destroy({
    error: onerror,
    success: function() {
      echo("Successfully deleted!");
      do_verify_delete(location.id);
    }
  });
}

function do_verify_delete(id) {
  echo("<h3>Checking if location "+id+" still exists:</h3>");
  console.log("(You should see an HTTP error right about here:)");
  var location = new Location({ id: id });
  location.fetch({
    success: onerror,
    error: function() {
      console.log("(...yep.)");
      echo("No, it doesn't.");
      do_success();
    }
  });
}

function do_success() {
  echo("<h3>Success!</h3>");
}

function print_location(location) {
  echo("<dl><dt>Name:</dt><dd>"+location.get('name')+"</dd></dl>");
  echo("<dl><dt>Address:</dt><dd>"+location.get('address')+"</dd></dl>");
  echo("<dl><dt>ID:</dt><dd>"+location.get('id')+"</dd></dl>");
}

// Helper functions
function echo(html) {
  $("#messages").append(html);
};

function onerror() {
  echo("<p class='error'>Oops... an error occured.</p>");
};

