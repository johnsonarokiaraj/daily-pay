class BudgetsController < ApplicationController
  def index
    @budgets = Budget.all
  end

  def create
    @budget = Budget.new(budget_params)
    msg = @budget.save ? { notice: "Spent category added successfully." } : { alert: @budget.errors.full_messages[0] }

    redirect_to budgets_path, **msg
  end

  private

  def budget_params
    params.require(:budget).permit(:name, :limit, :member_id, :spent_category_id)
  end
end
