AngularRestfulServer::Application.routes.draw do
  
  root :to => 'application#index'
  
  resources :users do
    resources :posts do
      resources :tags
      resources :categories, :only => [:get]
    end
  end

  resources :tags
  resources :categories
  
end
