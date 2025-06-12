class Api::TransactionsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @start_date = Date.current.beginning_of_month
    @end_date = Date.current.end_of_month

    if transaction_params[:allow_date].present? && transaction_params[:allow_date] != "0"
      @start_date = transaction_params[:start_date] || Date.current.beginning_of_month
      @end_date = transaction_params[:end_date] || Date.current.end_of_month
    end
    @transactions = get_transactions
    @credit = @transactions.where(is_credit: true).map{|t| t.amount}.sum
    @debit = @transactions.where(is_credit: false).map{|t| t.amount}.sum
    @tag_list = transaction_params[:tag_list]

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
    transactions =  Transaction.tagged_with(transaction_params[:tag_list]) if transaction_params[:tag_list].present?

    transactions.where(transaction_date: @start_date..@end_date).order(transaction_date: :desc, created_at: :desc)
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
