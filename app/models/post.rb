class Post < ActiveRecord::Base
  attr_accessible :category_id, :content, :user_id
  
  belogs_to :user
  belogs_to :category
  has_and_belongs_to_many :tags
  
end
