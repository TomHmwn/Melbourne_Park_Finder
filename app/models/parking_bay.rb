class ParkingBay < ApplicationRecord
  reverse_geocoded_by :latitude, :longitude,
  :address => :address
  after_validation :reverse_geocode
  has_one :trip

  def coordinates
    [longitude, latitude]
  end

  def directions_link
    "https://www.google.com/maps/dir/?api=1&destination=#{latitude},#{longitude}"
  end
end
