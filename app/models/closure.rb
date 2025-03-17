class Closure < ApplicationRecord

  validate :validate_closure
  def validate_budget
    validate_name(:name, "Closure name")
  end

end