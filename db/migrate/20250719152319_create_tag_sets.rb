class CreateTagSets < ActiveRecord::Migration[7.1]
  def change
    create_table :tag_sets do |t|
      t.string :name
      t.text :tags

      t.timestamps
    end
  end
end
