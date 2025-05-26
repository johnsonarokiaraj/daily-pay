class Budget < ApplicationRecord

  validate :validate_budget
  belongs_to :tags

  def validate_budget
    validate_name(:name, "Budget name")
    validate_limit(:limit, "Limit")
  end

end