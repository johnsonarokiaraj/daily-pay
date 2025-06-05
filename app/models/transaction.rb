class Transaction < ApplicationRecord

  acts_as_taggable_on :tags

  validate :validate_transaction

  def validate_transaction
    validate_name(:name, "Transcation name")
  end

  def tag_list=(names)
    names_array = names.is_a?(String) ? names.split(',') : names
    capitalized_names = names_array.map { |n| n.strip.capitalize }
    super(capitalized_names)
  end

end