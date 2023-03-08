class AddStMarkerIdToParkingBay < ActiveRecord::Migration[7.0]
  def change
    add_column :parking_bays, :st_marker_id, :integer
  end
end
