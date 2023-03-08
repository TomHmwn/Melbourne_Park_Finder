class RemoveColumnForTimer < ActiveRecord::Migration[7.0]
  def change
    remove_column :trips, :timer
  end
end
