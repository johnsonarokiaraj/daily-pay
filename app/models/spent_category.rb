class SpentCategory < ApplicationRecord

  has_many :budgets
  has_many :transactions

  validate :validate_spent_category

  def validate_spent_category
    validate_name(:name, "Spent category")
    validate_uniqueness(:name)
  end

end