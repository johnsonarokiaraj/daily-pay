class ReportsController < ApplicationController
  def index
    @tag_amounts = tag_amount_process
  end

  private

  def tag_amount_process
    tag_amounts_data = ActsAsTaggableOn::Tagging
                         .joins("INNER JOIN transactions ON taggings.taggable_id = transactions.id AND taggings.taggable_type = 'Transaction'")
                         .joins("INNER JOIN tags ON taggings.tag_id = tags.id")
                         .group("tags.name")
                         .sum("transactions.amount")

    # Format result into array of hashes if needed
    tag_amounts_data.map { |tag_name, total| { key: tag_name, value: total } }
  end

end




