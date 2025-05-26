class Budget < ApplicationRecord

  belongs_to :tag, class_name: 'ActsAsTaggableOn::Tag', foreign_key: 'tag_id'

  validate :validate_budget

  def validate_budget
    validate_limit(:amount, "Limit")
  end

end