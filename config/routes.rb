AngularRestfulServer::Application.routes.draw do
  
  root :to => 'application#test'
  
  resources :users do
    resources :posts do
      resources :tags
      resources :category
    end
  end  
  
end
