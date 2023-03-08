class CreateTrips < ActiveRecord::Migration[7.0]
  def change
    create_table :trips do |t|
      t.time :timer
      t.references :user, null: false, foreign_key: true
      t.references :parking_bay, null: false, foreign_key: true

      t.timestamps
    end
  end
end
