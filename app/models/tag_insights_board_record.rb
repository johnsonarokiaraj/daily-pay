class TagInsightsBoardRecord < ApplicationRecord
  # Stores user-created TagInsightsBoard configurations for future access
  # Attributes: name (string), main_tag (string), sub_tags (text/serialized array), user_id (optional), created_at, updated_at
  serialize :sub_tags, JSON
  validates :name, :main_tag, presence: true

  # Set default position before validation if not set
  before_validation :set_default_position, on: :create

  default_scope { order(:position) }

  private

  def set_default_position
    self.position ||= (TagInsightsBoardRecord.unscoped.maximum(:position) || 0) + 1
  end
end
