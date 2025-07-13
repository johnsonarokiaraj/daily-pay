class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.references :task_section, null: false, foreign_key: true
      t.string :task_id, null: false
      t.string :name, null: false
      t.text :description
      t.string :status, default: 'pending'
      t.date :completion_date
      t.integer :position, default: 0
      t.timestamps
    end

    add_index :tasks, :task_id, unique: true
    add_index :tasks, :status
    add_index :tasks, :completion_date
    add_index :tasks, [:task_section_id, :position]
  end
end
