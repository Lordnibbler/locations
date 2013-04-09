require './app'
require 'test/unit'
require 'rack/test'

ENV['RACK_ENV'] = 'test'

class HelloWorldTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    # Sinatra::Application
     @app ||= App.new
  end

  # GET /locations
  def test_it_returns_all_locations_in_json
    get '/locations'
    assert_equal last_response.status, 200
    assert_equal last_response.header['Content-Type'], "application/json;charset=utf-8"

    # parsed_body = JSON.parse(last_response.body)
    # parsed_body["foo"].should == "bar"
  end

  def test_it_creates_new_location
    # post '/locations', {"title"=>"Home", "address"=>"900 Haight Street, San Francisco, CA 94117, USA", "lat"=>37.7713501, "lng"=>-122.4372894, "selected"=>false}
    # puts last_response.body
  end

  # def test_it_loads_homepage
  #   get '/'
  #   assert last_response.ok?
  #   # assert_equal 'Location', last_response.body
  # end

  # def test_it_says_hello_to_a_person
  #   get '/', :name => 'Simon'
  #   assert last_response.body.include?('Simon')
  # end
end
