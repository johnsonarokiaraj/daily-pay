class CreateRecurringTransactions < ActiveRecord::Migration[7.0]
  def change
    create_table :recurring_transactions do |t|
      t.string :name, null: false
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.boolean :is_credit, default: false, null: false

      # schedule fields
      t.string :schedule_type, null: false # 'monthly', 'weekly', 'yearly'
      t.integer :day_of_month
      t.integer :weekday # 0..6 (Sunday..Saturday)
      t.integer :month_of_year # 1..12

      t.date :next_run_on
      t.date :last_run_on

      t.boolean :active, default: true, null: false

      t.text :tags # serialized JSON array

      t.timestamps
    end

    add_index :recurring_transactions, :next_run_on
    add_index :recurring_transactions, :active
  end
end
