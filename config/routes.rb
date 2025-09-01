Rails.application.routes.draw do
  # Remove these individual tag_sets routes
  # get 'tag_sets/index'
  # get 'tag_sets/new'
  # get 'tag_sets/create'
  # get 'tag_sets/edit'
  # get 'tag_sets/update'
  # get 'tag_sets/destroy'
  
  # Add proper resourceful routing for tag_sets
  resources :tag_sets
  
  # Add proper resourceful routing for auto_tag_rules
  resources :auto_tag_rules

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Service worker route
  get "/sw.js" => redirect("/404.html")

  # API routes for JSON responses - namespaced under /api
  namespace :api do
    resources :transactions, defaults: { format: :json } do
      collection do
        get :stats
        get :check_duplicate
      end
    end
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
    resources :targets, defaults: { format: :json } do
      member do
        get :progress
      end
    end
    resources :tag_insights_boards, only: [:index, :create, :show, :update]
    resources :task_sections, defaults: { format: :json } do
      resources :tasks, defaults: { format: :json } do
        resources :comments, defaults: { format: :json }
      end
    end
    resources :recurring_transactions, defaults: { format: :json } do
      collection do
        post :run_due
      end
    end
  end

  resources :tags, only: [:index]

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

  # SPA catch-all route for React
  get '*path', to: 'home#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
