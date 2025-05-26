class Transaction < ApplicationRecord

  acts_as_taggable_on :tags

  validate :validate_transaction

  def validate_transaction
    validate_name(:name, "Transcation name")
  end


end