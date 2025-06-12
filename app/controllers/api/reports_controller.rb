class Api::ReportsController < ApplicationController
  skip_before_action :verify_authenticity_token

  before_action :load_date
  def index
    @start_date = parse_date(params[:start_date]) || Date.current.beginning_of_month
    @end_date = parse_date(params[:end_date]) || Date.current.end_of_month
    
    # Current period data
    @tag_amounts = tag_amount_process(@start_date, @end_date)
    @monthly_trends = monthly_trends_process(@start_date, @end_date)
    @daily_trends = daily_trends_process(@start_date, @end_date)
    @credit_debit_breakdown = credit_debit_breakdown_process(@start_date, @end_date)
    
    # Annual comparison data
    @annual_tag_amounts = tag_amount_process(Date.current.beginning_of_year, Date.current.end_of_year)
    @yearly_comparison = yearly_comparison_process
    
    @filter = params[:filter]

    respond_to do |format|
      format.html
      format.json do
        render json: {
          tag_amounts: @tag_amounts,
          monthly_trends: @monthly_trends,
          daily_trends: @daily_trends,
          credit_debit_breakdown: @credit_debit_breakdown,
          annual_tag_amounts: @annual_tag_amounts,
          yearly_comparison: @yearly_comparison,
          start_date: @start_date,
          end_date: @end_date,
          filter: @filter,
          summary: {
            total_transactions: Transaction.where(transaction_date: @start_date..@end_date).count,
            total_amount: Transaction.where(transaction_date: @start_date..@end_date).sum(:amount),
            avg_transaction: Transaction.where(transaction_date: @start_date..@end_date).average(:amount)&.round(2) || 0
          }
        }
      end
    end
  end

  private

  def reports_params
    params.permit(:start_date, :end_date, :filter)
  end

  def parse_date(date_str)
    return nil if date_str.blank?
    
    begin
      # Try DD-MM-YYYY format first (from frontend)
      Date.strptime(date_str, "%d-%m-%Y")
    rescue ArgumentError
      begin
        # Try YYYY-MM-DD format
        Date.parse(date_str)
      rescue ArgumentError
        nil
      end
    end
  end

  def tag_amount_process(start_date, end_date)
    taggings = ActsAsTaggableOn::Tagging
                 .joins("INNER JOIN transactions ON taggings.taggable_id = transactions.id AND taggings.taggable_type = 'Transaction'")
                 .joins("INNER JOIN tags ON taggings.tag_id = tags.id")
                 .where("transactions.transaction_date BETWEEN ? AND ?", start_date.to_date, end_date.to_date)

    if params[:filter].present?
      taggings = taggings.where("tags.name = ?", params[:filter])
    end

    tag_amounts_data = taggings.group("tags.name").sum("transactions.amount")
    tag_amounts_data.map { |tag_name, total| { category: tag_name, amount: total.to_f } }
  end

  def monthly_trends_process(start_date, end_date)
    transactions = Transaction.where(transaction_date: start_date..end_date)
    
    # Group by month and get totals
    monthly_data = transactions
      .group("strftime('%Y-%m', transaction_date)")
      .group(:is_credit)
      .sum(:amount)
    
    # Transform data for charting
    result = []
    monthly_data.each do |(month, is_credit), amount|
      month_name = Date.parse("#{month}-01").strftime("%b %Y")
      type = is_credit ? "Credit" : "Debit"
      result << { month: month_name, type: type, amount: amount.to_f }
    end
    
    result.sort_by { |item| Date.parse("01 #{item[:month]}") }
  end

  def daily_trends_process(start_date, end_date)
    transactions = Transaction.where(transaction_date: start_date..end_date)
    
    # Group by day
    daily_data = transactions
      .group(:transaction_date)
      .group(:is_credit)
      .sum(:amount)
    
    # Transform data for charting
    result = []
    daily_data.each do |(date, is_credit), amount|
      type = is_credit ? "Credit" : "Debit"
      result << { 
        date: date.strftime("%d-%m-%Y"), 
        type: type, 
        amount: amount.to_f,
        day: date.strftime("%d %b")
      }
    end
    
    result.sort_by { |item| Date.strptime(item[:date], "%d-%m-%Y") }
  end

  def credit_debit_breakdown_process(start_date, end_date)
    transactions = Transaction.where(transaction_date: start_date..end_date)
    
    credit_total = transactions.where(is_credit: true).sum(:amount).to_f
    debit_total = transactions.where(is_credit: false).sum(:amount).to_f
    
    [
      { type: "Credit", amount: credit_total },
      { type: "Debit", amount: debit_total }
    ]
  end

  def yearly_comparison_process
    current_year = Date.current.year
    last_year = current_year - 1
    
    current_year_data = Transaction
      .where(transaction_date: Date.new(current_year, 1, 1)..Date.new(current_year, 12, 31))
      .group("strftime('%m', transaction_date)")
      .sum(:amount)
    
    last_year_data = Transaction
      .where(transaction_date: Date.new(last_year, 1, 1)..Date.new(last_year, 12, 31))
      .group("strftime('%m', transaction_date)")
      .sum(:amount)
    
    result = []
    (1..12).each do |month|
      month_name = Date.new(2024, month, 1).strftime("%b")
      current_amount = current_year_data[month.to_s.rjust(2, '0')] || 0
      last_amount = last_year_data[month.to_s.rjust(2, '0')] || 0
      
      result << { month: month_name, current_year: current_amount.to_f, last_year: last_amount.to_f }
    end
    
    result
  end


  def load_date
    if reports_params[:start_date].present? && reports_params[:end_date].present?
      @start_date = parse_date(reports_params[:start_date])
      @end_date = parse_date(reports_params[:end_date])
    end
  end

end




