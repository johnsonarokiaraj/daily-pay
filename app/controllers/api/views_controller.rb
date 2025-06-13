class Api::ViewsController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def index
    @views = View.recent
    render json: { views: @views }
  end
  
  def show
    @view = View.find(params[:id])
    render json: { view: @view, filters: @view.parsed_filters }
  end
  
  def create
    @view = View.new(view_params)
    
    if @view.save
      render json: { view: @view, message: 'View saved successfully' }
    else
      render json: { errors: @view.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    @view = View.find(params[:id])
    
    if @view.update(view_params)
      render json: { view: @view, message: 'View updated successfully' }
    else
      render json: { errors: @view.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @view = View.find(params[:id])
    @view.destroy
    render json: { message: 'View deleted successfully' }
  end
  
  private
  
  def view_params
    params.require(:view).permit(:name, :filters, :user_id)
  end
end
