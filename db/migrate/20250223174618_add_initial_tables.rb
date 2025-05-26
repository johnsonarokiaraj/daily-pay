class AddInitialTables < ActiveRecord::Migration[7.1]
  def change
    create_table :budgets do |t|
      t.integer :tag_id, null: false
      t.integer :amount, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.timestamps
    end

    create_table :transactions do |t|
      t.string :name, null: false, limit: 191
      t.integer :amount, null: false
      t.date :transaction_date, null: false
      t.timestamps
    end

    create_table :closures do |t|
      t.string :name, null: false, limit: 191
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.timestamps
    end
  end
end

