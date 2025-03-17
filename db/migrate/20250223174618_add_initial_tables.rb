class AddInitialTables < ActiveRecord::Migration[7.1]
  def change
    create_table :members do |t|
      t.string :name, null: false, limit: 191
      t.string :relationship, null: false, limit: 191
      t.timestamps
    end

    create_table :budgets do |t|
      t.string :name, null: false, limit: 191
      t.integer :limit, null: false
      t.integer :member_id, null: false
      t.integer :spent_category_id, null: false
      t.timestamps
    end

    create_table :transactions do |t|
      t.string :name, null: false, limit: 191
      t.integer :member_id, null: false
      t.integer :payment_source_id, null: false
      t.integer :spent_category_id, null: false
      t.integer :amount, null: false
      t.date :transaction_date, null: false
      t.timestamps
    end

    create_table :payment_sources do |t|
      t.string :name, null: false, limit: 191
      t.string :payment_type, null: false, limit: 191
      t.timestamps
    end

    create_table :spent_categories do |t|
      t.string :name, null: false, limit: 191
      t.timestamps
    end

    create_table :closures do |t|
      t.string :name, null: false, limit: 191
      t.date :closed_at, null: false
      t.timestamps
    end
  end
end

