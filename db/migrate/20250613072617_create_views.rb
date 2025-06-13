class CreateViews < ActiveRecord::Migration[7.1]
  def change
    create_table :views do |t|
      t.string :name, null: false
      t.text :filters
      t.integer :user_id
      t.timestamps
    end
    
    add_index :views, :user_id
  end
end
