class RemoveUserFromTrip < ActiveRecord::Migration[7.0]
  def change
    remove_reference :trips, :user, null: false, foreign_key: true
  end
end
