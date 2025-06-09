class ReportsController < ApplicationController

  before_action :load_date
  def index
    @start_date = Date.current.beginning_of_month
    @end_date = Date.current.end_of_month
    @tag_amounts = tag_amount_process

    #annual
    @start_date = Date.current.beginning_of_year
    @end_date = Date.current.end_of_year
    @annual_tag_amounts = tag_amount_process
    @filter = params[:filter]
  end

  private

  def reports_params
    params.permit(:start_date, :end_date)
  end

  def tag_amount_process
    taggings = ActsAsTaggableOn::Tagging
                 .joins("INNER JOIN transactions ON taggings.taggable_id = transactions.id AND taggings.taggable_type = 'Transaction'")
                 .joins("INNER JOIN tags ON taggings.tag_id = tags.id")
                 .where("transactions.transaction_date BETWEEN :start_date AND :end_date", start_date: @start_date, end_date: @end_date)

    if params[:filter].present?
      taggings = taggings.where("tags.name = ?", params[:filter])
    end

    tag_amounts_data = taggings.group("tags.name").sum("transactions.amount")
    tag_amounts_data.map { |tag_name, total| { key: tag_name, value: total } }
  end


  def load_date
    if reports_params[:start_date].present? && reports_params[:end_date].present?
      @start_date = reports_params[:start_date]
      @end_date = reports_params[:end_date]
    end
  end

end




