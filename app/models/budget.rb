class Budget < ApplicationRecord
  acts_as_taggable_on :tags

  validates :name, presence: true
  validates :limit, presence: true, numericality: { greater_than: 0 }

  def spent_amount
    Transaction.tagged_with(tag_list).sum(:amount)
  end

  def remaining_amount
    limit - spent_amount
  end

  def percentage_used
    return 0 if limit.zero?
    (spent_amount / limit * 100).round(2)
  end
end