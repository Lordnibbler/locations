$:.unshift File.expand_path('../../../lib', __FILE__)

require 'sinatra/base'
require 'json'
require 'data_mapper'
require 'geocoder'

# DataMapper.setup(:default, 'sqlite::memory:')
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'postgres://localhost/uber')

class Location
  include DataMapper::Resource
  property :id,        Serial    # An auto-increment integer key
  property :lat,  Float
  property :lng, Float
  property :address,   String
  property :name,      String

  def to_hash
    { :id        => id,
      :lat       => lat,
      :lng       => lng,
      :address   => address,
      :name      => name }
  end
end
DataMapper.finalize

# run this to migrate the db (add tables)
# DataMapper.auto_migrate!

class App < Sinatra::Base
  enable   :raise_errors, :logging
  enable   :show_exceptions  if development?

  set :root,   File.expand_path('../', __FILE__)
  set :views,  File.expand_path('../', __FILE__)
  set :public_folder, File.expand_path('../public', __FILE__)

  get '/' do
    erb :home
  end

  get '/dashboard' do
    # erb :dashboard
    send_file "dashboard.html"
  end


  get '/locations/:id' do
    # get a single location
    location = Location.get(params[:id])
    # params = JSON.parse(request.body.read.to_s)
    location.to_json
  end

  put '/locations/:id' do
    # PUT (update) an existing location
    # update this to check if params are different from location

    # get existing location from db
    location = Location.get(params[:id])

    # grab PUT data
    params = JSON.parse(request.body.read.to_s)

    # geocode the address
    params = geo_code(params)

    # update location record in db
    location.update(params)

    # return JSON (required for backbone to auto update)
    location.to_json
  end

  get '/locations' do
    # GET all locations
    Location.all.to_json
  end

  delete '/locations/:id' do
    # DELETE a location
    location = Location.get(params[:id])
    location.destroy
  end

  post '/locations' do
    # CREATE a location

    # grab POST data
    params = JSON.parse(request.body.read.to_s)

    # geocode the address
    params = geo_code(params)

    # create a new location record in db
    location = Location.create(params)

    # return JSON (required for backbone to auto update)
    location.to_json
  end

  # get '/create_sample_location' do
  #   # Location.auto_migrate!
  #   Location.create(:name => "test", :address => "test")
  # end

  def geo_code(params)
    if params
      geo_data = Geocoder.search(params["address"]).first
      params["address"] = geo_data.formatted_address
      params["lng"] = geo_data.longitude
      params["lat"] = geo_data.latitude
      params
    end
  end

  # alternatively, run rackup -p 4567 in terminal
  run! if app_file == $0
end

