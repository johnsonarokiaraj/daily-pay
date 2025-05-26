class BudgetsController < ApplicationController
  def index
    @budgets = Budget.includes(:tag).all
  end

  def create
    @budget = Budget.new(budget_params)
    msg = @budget.save ? { notice: "Spent category added successfully." } : { alert: @budget.errors.full_messages[0] }

    redirect_to budgets_path, **msg
  end

  def edit
    @budget = Budget.find(params[:id])
    render partial: "edit_form", locals: { budget: @budget }
  end

  def destroy
    @budget = Budget.find(params[:id])
    if @budget.present?
      @budget.destroy
      @msg = { notice: "Budget deleted successfully." }
    else
      @msg = { alert: "Unable to delete budget.!" }
    end

    redirect_to budgets_path, **@msg
  end

  private

  def budget_params
    params.require(:budget).permit(:tag_id, :amount, :start_date, :end_date)
  end
end
