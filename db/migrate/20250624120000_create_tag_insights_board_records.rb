class CreateTagInsightsBoardRecords < ActiveRecord::Migration[6.0]
  def change
    create_table :tag_insights_board_records do |t|
      t.string :name, null: false
      t.string :main_tag, null: false
      t.text :sub_tags
      t.integer :user_id
      t.timestamps
    end
  end
end