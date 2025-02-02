class AddYears < ActiveRecord::Migration[8.0]
  def change
    create_table :years do |t|
      t.string :name, null: false, limit: 191
      t.timestamps
    end

    create_table :months do |t|
      t.string :name, null: false, limit: 191
      t.integer :year_id, null: false
      t.timestamps
    end

    create_table :members do |t|
      t.string :name, null: false, limit: 191
      t.string :relationship, null: false, limit: 191
      t.timestamps
    end

    create_table :budgets do |t|
      t.integer :month_id, null: false
      t.integer :member_id, null: false
      t.integer :amount, null: false
      t.timestamps
    end

    create_table :ledger do |t|
      t.integer :member_id, null: false
      t.integer :payment_source_id, null: false
      t.integer :amount, null: false
      t.string :name, null: false, limit: 191
      t.timestamps
    end

    create_table :payment_source do |t|
      t.string :name, null: false, limit: 191
      t.string :type, null: false, limit: 191
      t.timestamps
    end

    create_table :spent_category do |t|
      t.string :name, null: false, limit: 191
      t.timestamps
    end

  end
end
