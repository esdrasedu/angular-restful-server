class GemController < ApplicationController
  
  def index
    require 'open-uri'
    open(URI.parse("http://rubygems.org/api/v1/gems/angular-restful.json")) {|f|
      render :text => f.read
    }
  end
  
end
  
  