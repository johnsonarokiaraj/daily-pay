class Comment < ApplicationRecord
  belongs_to :task

  validates :content, presence: true
  validates :author, presence: true

  scope :ordered, -> { order(:created_at) }

  def formatted_created_at
    created_at.strftime('%d/%m/%Y %H:%M')
  end
end
