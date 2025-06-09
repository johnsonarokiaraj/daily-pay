class TransactionsController < ApplicationController

  def index
    @start_date = Date.current.beginning_of_month
    @end_date = Date.current.end_of_month
    @transactions = Transaction.where(transaction_date: @start_date..@end_date).order(transaction_date: :desc, created_at: :desc)
    @total = @transactions.map{|t| t.amount}.sum
  end

  def create
    @transaction = Transaction.new(transaction_params)
    msg = @transaction.save ? { notice: "Transaction added successfully." } : { alert: @transaction.errors.full_messages[0] }

    redirect_to transactions_path, **msg
  end

  def edit
    @transaction = Transaction.find(params[:id])
    render partial: "edit_form", locals: { transaction: @transaction }
  end

  def update
    @transaction = Transaction.find(params[:id])
    if @transaction.update(transaction_params)
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

  def transaction_params
    params.require(:transaction).permit(:name, :amount, :transaction_date, :tag_list, :closure_id)
  end

end
