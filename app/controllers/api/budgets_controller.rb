class Api::BudgetsController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def index
    @budgets = Budget.all.map do |budget|
      spent = Transaction.tagged_with(budget.tag_list).sum(:amount) rescue 0
      {
        id: budget.id,
        name: budget.name,
        limit: budget.limit,
        spent: spent,
        tag_list: budget.tag_list || []
      }
    end

    respond_to do |format|
      format.html
      format.json do
        render json: {
          budgets: @budgets,
          tags: ActsAsTaggableOn::Tag.all.map { |tag| { id: tag.id, name: tag.name } }
        }
      end
    end
  end

  def create
    @budget = Budget.new(budget_params)
    
    respond_to do |format|
      if @budget.save
        format.html { redirect_to budgets_path, notice: "Budget added successfully." }
        format.json { render json: { status: 'success', budget: budget_json(@budget) } }
      else
        format.html { redirect_to budgets_path, alert: @budget.errors.full_messages[0] }
        format.json { render json: { status: 'error', errors: @budget.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def update
    @budget = Budget.find(params[:id])
    
    respond_to do |format|
      if @budget.update(budget_params)
        format.html { redirect_to budgets_path, notice: "Budget updated successfully." }
        format.json { render json: { status: 'success', budget: budget_json(@budget) } }
      else
        format.html { redirect_to budgets_path, alert: @budget.errors.full_messages[0] }
        format.json { render json: { status: 'error', errors: @budget.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @budget = Budget.find(params[:id])
    render partial: "edit_form", locals: { budget: @budget }
  end

  def destroy
    @budget = Budget.find(params[:id])
    
    respond_to do |format|
      if @budget.destroy
        format.html { redirect_to budgets_path, notice: "Budget deleted successfully." }
        format.json { render json: { status: 'success' } }
      else
        format.html { redirect_to budgets_path, alert: "Unable to delete budget!" }
        format.json { render json: { status: 'error' }, status: :unprocessable_entity }
      end
    end
  end

  private

  def budget_json(budget)
    spent = Transaction.tagged_with(budget.tag_list).sum(:amount) rescue 0
    {
      id: budget.id,
      name: budget.name,
      limit: budget.limit,
      spent: spent,
      tag_list: budget.tag_list || []
    }
  end

  def budget_params
    params.require(:budget).permit(:name, :limit, :tag_list)
  end
end
