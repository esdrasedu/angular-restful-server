class ApplicationController < ActionController::Base
  
  respond_to :html, :json
  
  inherit_resources
  
  protect_from_forgery
  
  skip_before_filter :verify_authenticity_token

end
