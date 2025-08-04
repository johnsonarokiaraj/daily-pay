class AutoTagRule < ApplicationRecord
  serialize :required_tags, coder: JSON
  serialize :auto_tags, coder: JSON

  validates :required_tags, presence: true
  validates :auto_tags, presence: true

  def required_tags_array
    required_tags || []
  end

  def auto_tags_array
    auto_tags || []
  end
end
