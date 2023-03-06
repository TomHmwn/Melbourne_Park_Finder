class AddLastUpdatedToParkingBays < ActiveRecord::Migration[7.0]
  def change
    add_column :parking_bays, :sensorLastUpdated, :datetime
  end
end
