# app/controllers/transactions_controller.rb
class TransactionsController < ApplicationController
  before_action :authenticate_user!

  def index
    # Render the React SPA root
    render file: Rails.root.join('app', 'views', 'home', 'index.html.erb'), layout: 'application'
  end
end
