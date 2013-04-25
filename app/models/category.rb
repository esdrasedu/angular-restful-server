class Category < ActiveRecord::Base
  
  attr_accessible :color
  
  has_one :post
  
end
