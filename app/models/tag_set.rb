class TagSet < ApplicationRecord
  serialize :tags, coder: JSON

  validates :name, presence: true, uniqueness: true

  def tags_array
    tags || []
  end

  def tags_string
    tags_array.join(", ")
  end

  def tags_string=(value)
    self.tags = value.split(",").map(&:strip).reject(&:blank?)
  end
end
