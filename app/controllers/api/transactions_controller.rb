class Api::TransactionsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_date_range, only: [:index]
  before_action :run_due_recurring, only: [:index]

  def index
    @apply_date_filter = params[:start_date].present? || params[:end_date].present?
    
    # Pagination parameters
    page = (params[:page] || 1).to_i
    page_size = (params[:page_size] || 25).to_i
    offset = (page - 1) * page_size
    
    # Get all matching transactions for totals calculation
    all_transactions = get_transactions
    total_count = all_transactions.count
    total_pages = (total_count.to_f / page_size).ceil
    
    # Get paginated transactions
    @transactions = all_transactions.limit(page_size).offset(offset)
    @credit = all_transactions.where(is_credit: true).sum(:amount)
    @debit = all_transactions.where(is_credit: false).sum(:amount)

    respond_to do |format|
      format.json do
        render json: {
          transactions: @transactions.map do |t|
            {
              id: t.id,
              name: t.name,
              amount: t.amount,
              transaction_date: t.transaction_date,
              is_credit: t.is_credit?,
              tag_list: t.tag_list.sort,
              formatted_amount: t.formatted_amount,
              reminder: t.reminder
            }
          end,
          credit: @credit,
          debit: @debit,
          pagination: {
            page: page,
            page_size: page_size,
            total_pages: total_pages,
            total_count: total_count,
            has_more: page < total_pages
          },
          tag_names: ActsAsTaggableOn::Tag.all.pluck(:name)
        }
      end
    end
  end

  def create
    @transaction = Transaction.new(update_params)

    respond_to do |format|
      if @transaction.save
        format.html { redirect_to transactions_path, notice: "Transaction added successfully." }
        format.json { render json: { status: 'success', transaction: transaction_json(@transaction) } }
      else
        format.html { redirect_to transactions_path, alert: @transaction.errors.full_messages[0] }
        format.json { render json: { status: 'error', errors: @transaction.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @transaction = Transaction.find(params[:id])
    render partial: "edit_form", locals: { transaction: @transaction }
  end

  def update
    @transaction = Transaction.find(params[:id])

    respond_to do |format|
      if @transaction.update(update_params)
        format.js   # Will render update.js.erb
        format.html { redirect_to transactions_path, notice: "Transaction updated." }
        format.json { render json: { status: 'success', transaction: transaction_json(@transaction) } }
      else
        format.js { render js: "alert('Update failed');" }
        format.json { render json: { status: 'error', errors: @transaction.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @transaction = Transaction.find(params[:id])

    respond_to do |format|
      if @transaction.destroy
        format.html { redirect_to transactions_path, notice: "Transaction deleted." }
        format.json { render json: { status: 'success' } }
      else
        format.html { redirect_to transactions_path, alert: "Failed to delete transaction." }
        format.json { render json: { status: 'error' }, status: :unprocessable_entity }
      end
    end
  end

  def monthly_dashboard(params)
    @monthly_tag  = params[:monthly_tag]
    @sub_tags = [["personal"], ["Parents", "Home expense"], ["Yosh", "Home expense"], ["Bills"], ["Extras"], ["Adhya"], ["Vyom"], ["Home loan"], ["Land loan"], ["Insurance"], ["Top up loan"]]
    Transaction.transactions_on_subtags(@monthly_tag, @sub_tags)
  end

  # GET /api/transactions/stats
  def stats
    filters = params.permit(:start_date, :end_date, :tag_list, :transaction_name)
    transactions = Transaction.all
    if filters[:start_date].present?
      transactions = transactions.where('transaction_date >= ?', Date.strptime(filters[:start_date], '%d-%m-%Y'))
    end
    if filters[:end_date].present?
      transactions = transactions.where('transaction_date <= ?', Date.strptime(filters[:end_date], '%d-%m-%Y'))
    end
    if filters[:tag_list].present?
      tags = filters[:tag_list].split(',')
      transactions = transactions.tagged_with(tags)
    end
    if filters[:transaction_name].present?
      transactions = transactions.where("name LIKE ?", "%#{filters[:transaction_name]}%")
    end
    credit = transactions.where(is_credit: true).sum(:amount)
    debit = transactions.where(is_credit: false).sum(:amount)
    render json: { credit: credit, debit: debit }
  end

  def check_duplicate
    date_str = params[:transaction_date]
    amount = params[:amount]

    begin
      date = Date.strptime(date_str, '%d-%m-%Y') if date_str.present?
    rescue ArgumentError
      return render json: { error: 'Invalid date format' }, status: :unprocessable_entity
    end

    if date.blank? || amount.blank?
      return render json: { error: 'transaction_date and amount are required' }, status: :unprocessable_entity
    end

    duplicate = Transaction.where(transaction_date: date, amount: amount).exists?
    render json: { duplicate: duplicate }
  end

  private

  def set_date_range
    @start_date = params[:start_date].present? ? Date.strptime(params[:start_date], '%d-%m-%Y') : Date.current.beginning_of_month
    @end_date = params[:end_date].present? ? Date.strptime(params[:end_date], '%d-%m-%Y') : Date.current.end_of_month
  end

  def run_due_recurring
    RecurringTransaction.run_due!
  rescue => e
    Rails.logger.error("Failed to run recurring transactions: #{e.class} - #{e.message}")
  end

  def transaction_json(transaction)
    {
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      is_credit: transaction.is_credit?,
      tag_list: transaction.tag_list,
      formatted_amount: transaction.formatted_amount,
      reminder: transaction.reminder
    }
  end

  def get_transactions
    transactions = Transaction.all

    # Apply tag filter if present
    if params[:tag_list].present?
      transactions = transactions.tagged_with(params[:tag_list])
    end

    # Apply transaction name filter if present
    if params[:transaction_name].present?
      transactions = transactions.where("name LIKE ?", "%#{params[:transaction_name]}%")
    end

    # Only apply date filter if explicitly requested or dates are provided
    if @apply_date_filter
      transactions = transactions.where(transaction_date: @start_date..@end_date)
    end

    transactions.order(transaction_date: :desc, created_at: :desc)
  end

  def transaction_params
    params["transaction"] || {}
  end

  def update_params
    # Handle both nested transaction data and direct data from frontend
    if params[:transaction].present?
      # Filter out computed/read-only fields like id and formatted_amount
      permitted_params = params.require(:transaction).permit(:name, :amount, :transaction_date, :is_credit, tag_list: [], reminder: {})
      # Remove id and formatted_amount if they exist in the nested params
      permitted_params.except(:id, :formatted_amount)
    else
      params.permit(:name, :amount, :transaction_date, :is_credit, tag_list: [], reminder: {}).except(:id, :formatted_amount)
    end
  end

  def permitted_params
    params.permit!
  end
end
