class Admin::SpentCategoriesController < ApplicationController
  def index
    @spent_categories = SpentCategory.all
  end

  def create
    @spent_category = SpentCategory.new(spent_category_params)
    msg = @spent_category.save ? { notice: "Spent category added successfully." } : { alert: @spent_category.errors.full_messages[0] }

    redirect_to admin_spent_categories_path, **msg
  end

  private

  def spent_category_params
    params.require(:spent_category).permit(:name)
  end
end
