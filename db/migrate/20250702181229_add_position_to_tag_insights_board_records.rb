class AddPositionToTagInsightsBoardRecords < ActiveRecord::Migration[7.1]
  def change
    add_column :tag_insights_board_records, :position, :integer
  end
end
