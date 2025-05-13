class Transaction < ApplicationRecord

  acts_as_taggable_on :tags
  
  belongs_to :member
  belongs_to :payment_source
  belongs_to :spent_category

  validate :validate_transaction

  def validate_transaction
    validate_name(:name, "Transcation")
  end

end