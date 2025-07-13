class AddNameToTargets < ActiveRecord::Migration[6.0]
  def change
    add_column :targets, :name, :string
  end
end

