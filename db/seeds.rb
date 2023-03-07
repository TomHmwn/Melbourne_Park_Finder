require "open-uri"

# clearing the database
puts "Cleaning database"
ParkingBay.destroy_all

# creating parking bays from melbourne open data
# https://data.melbourne.vic.gov.au/explore/dataset/on-street-parking-bay-sensors/api/

URL = "https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=500&facet=status&facet=parking_zone&facet=last_updated"

puts "parsing Melbourne parking data..."

html = URI.open(URL).read # open the html of the page
doc = JSON.parse(html)

puts "Creating Parking Bays..."

doc["records"].each do |record|
  record["fields"]["status"] == "Present" ? occupied = true : occupied = false
  ParkingBay.create!(
    occupied:,
    longitude: record["fields"]["lon"],
    latitude: record["fields"]["lat"],
    sensorLastUpdated: record["fields"]["last_updated"],
    st_marker_id: record["fields"]["st_marker_id"]
  )
end

puts "Finished!"
