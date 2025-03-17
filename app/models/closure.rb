class Closure < ApplicationRecord

  validate :validate_closure
  def validate_closure
    validate_name(:name, "Closure name")
  end

end