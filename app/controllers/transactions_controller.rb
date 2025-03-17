class TransactionsController < ApplicationController
  def index
    @transactions = Transaction.all
  end

  def create
    @transaction = Transaction.new(transaction_params)
    msg = @transaction.save ? { notice: "Transaction added successfully." } : { alert: @transaction.errors.full_messages[0] }

    redirect_to transactions_path, **msg
  end

  private

  def transaction_params
    params.require(:transaction).permit(:name, :amount, :member_id, :spent_category_id, :payment_source_id, :transaction_date)
  end
end
