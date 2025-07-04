class Api::TransactionsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    # Only set date defaults if no allow_date flag is passed or if dates are explicitly provided
    @apply_date_filter = true
    @start_date = Date.current.beginning_of_month
    @end_date = Date.current.end_of_month
    if params[:allow_date] == "1" || params[:start_date].present? || params[:end_date].present?
      @start_date = params[:start_date]
      @end_date = params[:end_date]
    end
    
    @transactions = get_transactions
    @credit = @transactions.where(is_credit: true).map{|t| t.amount}.sum
    @debit = @transactions.where(is_credit: false).map{|t| t.amount}.sum
    @tag_list = params[:tag_list]

    respond_to do |format|
      format.html
      format.json do
        render json: {
          transactions: @transactions.map do |t|
            {
              id: t.id,
              name: t.name,
              amount: t.amount,
              transaction_date: t.transaction_date,
              is_credit: t.is_credit?,
              tag_list: t.tag_list,
              formatted_amount: t.formatted_amount
            }
          end,
          credit: @credit,
          debit: @debit,
          count: @transactions.count,
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
    filters = params.permit(:start_date, :end_date, :tag_list)
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
    credit = transactions.where(is_credit: true).sum(:amount)
    debit = transactions.where(is_credit: false).sum(:amount)
    render json: { credit: credit, debit: debit }
  end


  private
  
  def transaction_json(transaction)
    {
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      is_credit: transaction.is_credit?,
      tag_list: transaction.tag_list,
      formatted_amount: transaction.formatted_amount
    }
  end

  def get_transactions
    transactions = Transaction.all
    
    # Apply tag filter if present
    if params[:tag_list].present?
      transactions = Transaction.tagged_with(params[:tag_list])
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
    params.require(:transaction).permit(:name, :amount, :transaction_date, :tag_list, :is_credit)
  end

  def permitted_params
    params.permit!
  end
end
