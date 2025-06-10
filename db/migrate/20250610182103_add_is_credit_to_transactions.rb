class AddIsCreditToTransactions < ActiveRecord::Migration[7.1]
  def change
    add_column :transactions, :is_credit, :boolean, default: false, null: false
  end
end
