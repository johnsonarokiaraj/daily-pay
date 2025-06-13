class DropBudgetsTable < ActiveRecord::Migration[7.1]
  def change
    drop_table :budgets do |t|
      t.string :name
      t.decimal :limit, precision: 10, scale: 2
      t.text :tag_list
      t.timestamps
    end
  end
end
