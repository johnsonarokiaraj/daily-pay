class View < ApplicationRecord
  validates :name, presence: true
  validates :filters, presence: true
  
  # For future user association
  # belongs_to :user, optional: true
  has_many :targets, dependent: :destroy
  
  # Parse filters JSON
  def parsed_filters
    JSON.parse(filters) rescue {}
  end
  
  # Set filters from hash
  def filters=(value)
    if value.is_a?(Hash)
      super(value.to_json)
    else
      super(value)
    end
  end
  
  scope :recent, -> { order(created_at: :desc) }
end
