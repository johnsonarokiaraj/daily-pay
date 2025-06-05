class ReportsController < ApplicationController

  before_action :load_date
  def index
    @start_date = @closure.start_date
    @end_date = @closure.end_date
    @tag_amounts = tag_amount_process
  end

  def annual
    @start_date = Date.current.beginning_of_year
    @end_date = Date.current.end_of_year
    @tag_amounts = tag_amount_process
  end

  private

  def tag_amount_process
    tag_amounts_data = ActsAsTaggableOn::Tagging
                         .joins("INNER JOIN transactions ON taggings.taggable_id = transactions.id AND taggings.taggable_type = 'Transaction'")
                         .joins("INNER JOIN tags ON taggings.tag_id = tags.id")
                         .where("transactions.transaction_date BETWEEN :start_date AND :end_date", start_date: @start_date, end_date: @end_date)
                         .group("tags.name")
                         .sum("transactions.amount")

    # Format result into array of hashes if needed
    tag_amounts_data.map { |tag_name, total| { key: tag_name, value: total } }
  end

  def load_date
    @closure = Closure.last
  end

end




