class ApplicationController < ActionController::Base
  
  respond_to :json
  
  inherit_resources
  
  protect_from_forgery
  
  after_filter :set_access_control_headers

  def set_access_control_headers 
    headers['Access-Control-Allow-Origin'] = '*' 
    headers['Access-Control-Request-Method'] = '*' 
  end

end
