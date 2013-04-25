AngularRestfulServer::Application.routes.draw do
  
  resources :users do
    resources :posts do
      resources :tags
      resources :category
    end
  end
  
end
