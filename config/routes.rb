Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Service worker route
  get "/sw.js" => redirect("/404.html")

  # API routes for JSON responses - namespaced under /api
  namespace :api do
    resources :transactions, defaults: { format: :json }
    resources :reports, defaults: { format: :json }
    resources :tags, defaults: { format: :json }
    resources :closures, defaults: { format: :json }
    resources :views, defaults: { format: :json }
  end

  # SPA routes - catch all routes and serve the React app
  root "home#index"
  
  # Catch all other routes and serve the React app
  get "*path", to: "home#index", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
