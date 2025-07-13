class AddReminderToTransactions < ActiveRecord::Migration[6.0]
  def change
    add_column :transactions, :reminder, :jsonb, default: {}
  end
end

