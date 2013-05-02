AngularRestfulServer::Application.routes.draw do
  
  root :to => 'application#test'
  
  resources :users do
    resources :posts do
      resources :tags
      resources :category, :only => [:get]
    end
  end

  resources :tags
  resources :category
	
  match '/gem' => 'gem#index'
  
end
