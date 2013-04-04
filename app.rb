$:.unshift File.expand_path('../../../lib', __FILE__)

require 'sinatra/base'
require 'sequel'
require 'sinatra/backbone'

DB = Sequel.connect("sqlite::memory:")
DB.create_table :locations do
  primary_key :id
  Float :latitude
  Float :longitude
  String :address
  String :name
end

class Location < Sequel::Model
  def to_hash
    { :id => id, :latitude => latitude, :longitude => longitude, :address => address, :name => name }
  end

  def validate
    errors.add :name, "can't be empty"  if name.to_s.size == 0
  end
end

class App < Sinatra::Base
  enable   :raise_errors, :logging
  enable   :show_exceptions  if development?

  register Sinatra::RestAPI

  rest_create("/location") { Location.new }
  rest_resource("/location/:id") { |id| Location[id] }

  set :root,   File.expand_path('../', __FILE__)
  set :views,  File.expand_path('../', __FILE__)
  set :public_folder, File.expand_path('../public', __FILE__)

  get '/' do
    erb :home
  end

  # alternatively, run rackup -p 4567 in terminal
  run! if app_file == $0
end

