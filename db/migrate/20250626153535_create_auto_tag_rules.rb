class CreateAutoTagRules < ActiveRecord::Migration[7.1]
  def change
    create_table :auto_tag_rules do |t|
      t.text :required_tags
      t.text :auto_tags

      t.timestamps
    end
  end
end
