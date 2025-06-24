class TagInsightsBoardRecord < ApplicationRecord
  # Stores user-created TagInsightsBoard configurations for future access
  # Attributes: name (string), main_tag (string), sub_tags (text/serialized array), user_id (optional), created_at, updated_at
  serialize :sub_tags, JSON
  validates :name, :main_tag, presence: true
end

