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
    resources :backups, only: [:index], defaults: { format: :json } do
      collection do
        post :upload_to_drive
        get :folder_id
        post :folder_id, action: :set_folder_id
      end
    end
  end

  # Serve backup files for download
  get '/backups/:filename', to: proc { |env|
    req = Rack::Request.new(env)
    filename = req.path_info.split('/').last
    backup_path = Rails.root.join('db', 'backups', filename)
    if File.exist?(backup_path)
      [200, {
        'Content-Type' => 'application/sql',
        'Content-Disposition' => "attachment; filename=\"#{filename}\""
      }, [File.read(backup_path)]]
    else
      [404, { 'Content-Type' => 'text/plain' }, ['Not found']]
    end
  }

  # SPA routes - catch all routes and serve the React app
  root "home#index"
  
  # Catch all other routes and serve the React app
  get "*path", to: "home#index", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
