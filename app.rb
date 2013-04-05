$:.unshift File.expand_path('../../../lib', __FILE__)

require 'sinatra/base'
require 'sinatra/backbone'
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


class App < Sinatra::Base
  enable   :raise_errors, :logging
  enable   :show_exceptions  if development?

  set :root,   File.expand_path('../', __FILE__)
  set :views,  File.expand_path('../', __FILE__)
  set :public_folder, File.expand_path('../public', __FILE__)

  register Sinatra::RestAPI

  rest_create("/locations") { Location.new }
  rest_resource("/locations") { Location.all }
  rest_resource("/location/:id") { |id| Location[id] }


  get '/' do
    erb :home
  end

  get '/dashboard' do
    # erb :dashboard
    send_file "dashboard.html"
  end


  # get '/create_sample_location' do
  #   # Location.auto_migrate!
  #   Location.create(:name => "test", :address => "test")
  # end

  # get '/locations' do
  #   # list all locations available
  #   Location.all.to_json
  # end
  # get '/location/:id' do
  #   # get a single location
  #   Location.where(:id => params[:id]).first
  # end
  # post '/location' do
  #   # create a new location
  #   Location.create(params[:location])
  # end
  # put '/location/:id' do
  #   # update an existing location

  # end
  # delete '/location/:id' do
  #   # delete an item
  #   Location.destroy(params[:location])
  # end

  # alternatively, run rackup -p 4567 in terminal
  run! if app_file == $0
end

