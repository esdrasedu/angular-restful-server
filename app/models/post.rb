class Post < ActiveRecord::Base
  attr_accessible :category_id, :content, :user_id

  belongs_to :user
  belongs_to :category
  has_and_belongs_to_many :tags
  
end
