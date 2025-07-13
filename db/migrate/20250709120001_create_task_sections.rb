class CreateTaskSections < ActiveRecord::Migration[7.1]
  def change
    create_table :task_sections do |t|
      t.string :name, null: false
      t.string :abbreviation, null: false, limit: 10
      t.text :description
      t.integer :position, default: 0
      t.timestamps
    end

    add_index :task_sections, :abbreviation, unique: true
    add_index :task_sections, :position
  end
end
