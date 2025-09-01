class RunRecurringTransactionsJob < ApplicationJob
  queue_as :default

  def perform
    RecurringTransaction.run_due!
  end
end
