class Api::TargetsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_target, only: [:show, :update, :destroy]

  # GET /api/targets
  def index
    @targets = Target.all.order(target_date: :desc)
    render json: @targets
  end

  # GET /api/targets/:id
  def show
    render json: @target
  end

  # POST /api/targets
  def create
    @target = Target.new(target_params)
    if @target.save
      render json: @target, status: :created
    else
      render json: { errors: @target.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/targets/:id
  def update
    if @target.update(target_params)
      render json: @target
    else
      render json: { errors: @target.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/targets/:id
  def destroy
    @target.destroy
    head :no_content
  end

  # GET /api/targets/:id/progress
  # Returns chart data for the target (balance/credit/debit over time)
  def progress
    target = Target.find(params[:id])
    # Example: get daily balances for the view up to the target date
    data = Target.progress_data_for(target)
    render json: data
  end

  private

  def set_target
    @target = Target.find(params[:id])
  end

  def target_params
    params.require(:target).permit(:view_id, :target_type, :value, :target_date)
  end
end
