class TransactionsController < ApplicationController

  def index
    @start_date = Date.current.beginning_of_month
    @end_date = Date.current.end_of_month

    if transaction_params[:allow_date].present? && transaction_params[:allow_date] != "0"
      @start_date = transaction_params[:start_date] || Date.current.beginning_of_month
      @end_date = transaction_params[:end_date] || Date.current.end_of_month
    end
    @transactions = get_transactions
    @total = @transactions.map{|t| t.amount}.sum
    @tag_list = transaction_params[:tag_list]
  end

  def create
    @transaction = Transaction.new(update_params)
    msg = @transaction.save ? { notice: "Transaction added successfully." } : { alert: @transaction.errors.full_messages[0] }

    redirect_to transactions_path, **msg
  end

  def edit
    @transaction = Transaction.find(params[:id])
    render partial: "edit_form", locals: { transaction: @transaction }
  end

  def update
    @transaction = Transaction.find(params[:id])
    if @transaction.update(update_params)
      respond_to do |format|
        format.js   # Will render update.js.erb
        format.html { redirect_to transactions_path, notice: "Transaction updated." }
      end
    else
      respond_to do |format|
        format.js { render js: "alert('Update failed');" }
      end
    end
  end

  private
  def get_transactions
    transactions = Transaction.all
    transactions =  Transaction.tagged_with(transaction_params[:tag_list]) if transaction_params[:tag_list].present?

    transactions.where(transaction_date: @start_date..@end_date).order(transaction_date: :desc, created_at: :desc)
  end

  def transaction_params
    params["transaction"] || {}
  end

  def update_params
    params.require(:transaction).permit(:name, :amount, :transaction_date, :tag_list)
  end

  def permitted_params
    params.permit!
  end
end
