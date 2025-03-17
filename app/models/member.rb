class Member < ApplicationRecord

  RELATION_TYPES = ["spouse", "self", "kids", "family", "parent"]

  has_many :budgets
  has_many :transactions

  validate :validate_member

  def validate_member
    validate_name(:name, "Member name")
    validate_uniqueness(:name)
    errors.add(:base, "Spouse already exists in the system") if self.relationship == "spouse" && Member.exists?(relationship: "spouse")
  end

end