class ParkingBay < ApplicationRecord
  reverse_geocoded_by :latitude, :longitude,
  :address => :address
  after_validation :reverse_geocode

  def coordinates
    [longitude, latitude]
  end

  def to_feature
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": coordinates
      },
      "properties": {
        "parking_bay_id": id,
        "address": address,
        "info_window": ApplicationController.new.render_to_string(
          partial: "parking_bays/info_window",
          locals: { parking_bay: self }
        )
      }
    }
  end
end