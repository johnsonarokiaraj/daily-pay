class AddInitialTables < ActiveRecord::Migration[7.1]
  def change
    # Transactions table
    create_table :transactions do |t|
      t.string :name, null: false, limit: 191
      t.integer :amount, null: false
      t.date :transaction_date, null: false
      t.boolean :is_credit, default: false, null: false
      t.json :reminder
      t.timestamps
    end

    # ActsAsTaggableOn tables
    create_table :tags do |t|
      t.string :name
      t.integer :taggings_count, default: 0
      t.timestamps
    end
    add_index :tags, :name, unique: true, name: 'index_tags_on_name'

    create_table :taggings do |t|
      t.references :tag, foreign_key: { to_table: :tags }
      t.references :taggable, polymorphic: true
      t.references :tagger, polymorphic: true
      t.string :context, limit: 128
      t.datetime :created_at
      t.string :tenant, limit: 128
    end
    add_index :taggings, %i[taggable_id taggable_type context], name: 'taggings_taggable_context_idx'
    add_index :taggings, :taggable_id
    add_index :taggings, :taggable_type
    add_index :taggings, :tagger_id
    add_index :taggings, :context
    add_index :taggings, %i[tagger_id tagger_type]
    add_index :taggings, %i[taggable_id taggable_type tagger_id context], name: 'taggings_idy'
    add_index :taggings, :tenant

    # Views table
    create_table :views do |t|
      t.string :name, null: false
      t.text :filters
      t.integer :user_id
      t.timestamps
    end
    add_index :views, :user_id

    # Targets table
    create_table :targets do |t|
      t.references :view, null: false, foreign_key: true
      t.string :target_type, null: false
      t.decimal :value, precision: 15, scale: 2, null: false
      t.date :target_date, null: false
      t.string :name
      t.timestamps
    end
    add_index :targets, [:view_id, :target_type, :target_date], unique: true

    # TagInsightsBoardRecords table
    create_table :tag_insights_board_records do |t|
      t.string :name, null: false
      t.string :main_tag, null: false
      t.text :sub_tags
      t.integer :user_id
      t.integer :position
      t.timestamps
    end

    # AutoTagRules table
    create_table :auto_tag_rules do |t|
      t.text :required_tags
      t.text :auto_tags
      t.timestamps
    end

    # TaskSections table
    create_table :task_sections do |t|
      t.string :name, null: false
      t.string :abbreviation, null: false, limit: 10
      t.text :description
      t.integer :position, default: 0
      t.timestamps
    end
    add_index :task_sections, :abbreviation, unique: true
    add_index :task_sections, :position

    # Tasks table
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

    # Comments table
    create_table :comments do |t|
      t.references :task, null: false, foreign_key: true
      t.text :content
      t.string :author
      t.timestamps
    end
  end
end
