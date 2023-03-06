class CreateParkingBays < ActiveRecord::Migration[7.0]
  def change
    create_table :parking_bays do |t|
      t.boolean :occupied
      t.float :longitude
      t.float :latitude
      t.string :address

      t.timestamps
    end
  end
end
