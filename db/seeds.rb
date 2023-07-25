require "open-uri"

# Function to create parking bays from a batch of records
def create_parking_bays(records)
  begin
    records.each do |record|
      occupied = (record["fields"]["status_description"] == "Present")
      ParkingBay.create!(
        occupied: occupied,
        longitude: record["fields"]["location"][1],
        latitude: record["fields"]["location"][0],
        sensorLastUpdated: record["fields"]["lastupdated"],
        st_marker_id: record["fields"]["parkingbay_id"]
      )
    end
  end
end


# clearing the database
puts "Cleaning database"
ParkingBay.destroy_all

# creating parking bays from melbourne open data
URL = "https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=50&facet=status&facet=parking_zone&facet=last_updated"

puts "parsing Melbourne parking data..."

total_rows = 4390
batch_size = 50
num_batches = (total_rows / batch_size.to_f).ceil

(0...num_batches).each do |batch_number|
  start_row = batch_number * batch_size
  api_url = "#{URL}&start=#{start_row}"

  puts "Fetching batch #{batch_number + 1}/#{num_batches}"
  html = URI.open(api_url).read
  batch_records = JSON.parse(html)["records"]

  puts "Creating Parking Bays for batch #{batch_number + 1}/#{num_batches}"
  create_parking_bays(batch_records)

  sleep(2) # Sleep for 1 second between batches to avoid overwhelming the API
end

puts "Finished!"
