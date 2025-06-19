class CreateTargets < ActiveRecord::Migration[6.1]
  def change
    create_table :targets do |t|
      t.references :view, null: false, foreign_key: true
      t.string :target_type, null: false # 'credit', 'debit', or 'balance'
      t.decimal :value, precision: 15, scale: 2, null: false
      t.date :target_date, null: false
      t.timestamps
    end
    add_index :targets, [:view_id, :target_type, :target_date], unique: true
  end
end
