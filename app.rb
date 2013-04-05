$:.unshift File.expand_path('../../../lib', __FILE__)

require 'sinatra/base'
require 'json'
require 'data_mapper'

# DataMapper.setup(:default, 'sqlite::memory:')
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'postgres://localhost/uber')

class Location
  include DataMapper::Resource
  property :id,        Serial    # An auto-increment integer key
  property :latitude,  Float
  property :longitude, Float
  property :address,   String
  property :name,      String

  def to_hash
    { :id        => id,
      :latitude  => latitude,
      :longitude => longitude,
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
    location = Location.get(params[:id])
    params = JSON.parse(request.body.read.to_s)
    location.update(params)
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
    params = JSON.parse(request.body.read.to_s)
    Location.create(params)
  end

  # get '/create_sample_location' do
  #   # Location.auto_migrate!
  #   Location.create(:name => "test", :address => "test")
  # end

  # alternatively, run rackup -p 4567 in terminal
  run! if app_file == $0
end

