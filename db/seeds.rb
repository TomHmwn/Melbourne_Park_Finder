require "open-uri"

# Function to create parking bays from a batch of records
def create_parking_bays(records)
  retry_count = 3
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
  rescue Geocoder::LookupTimeout, Net::OpenTimeout => e
    if retry_count > 0
      puts "Encountered timeout error. Retrying in 5 seconds..."
      sleep(5)
      retry_count -= 1
      retry
    else
      puts "Retries exhausted. Unable to geocode this batch."
      # You can choose to log the error or handle it as needed
    end
  rescue Geocoder::Error => e
    Rails.logger.error("Geocoder::ResponseParseError: #{e.message}. Failed to parse response for parkingbay_id: #{record['fields']['parkingbay_id']}, recordid: #{record['recordid']}")
    if retry_count > 0
      puts "Encountered response parse error. Retrying in 5 seconds..."
      sleep(5)
      retry_count -= 1
      retry
    else
      puts "Retries exhausted. Unable to parse response for this batch."
      # You can choose to log the error or handle it as needed
    end
  rescue Geocoder::NetworkError => e
    if retry_count > 0
      puts "Encountered network error. Retrying in 5 seconds..."
      sleep(5)
      retry_count -= 1
      retry
    else
      puts "Retries exhausted. Unable to geocode this batch."
      # Rails.logger.error("Geocoder::NetworkError: #{e.message}")

      # You can choose to log the error or handle it as needed

      # Include the parkingbay_id and recordid in the log message
      Rails.logger.error("Geocoder::NetworkError: #{e.message}. Failed to geocode parkingbay_id: #{record['fields']['parkingbay_id']}, recordid: #{record['recordid']}")

      # Include batch information in the log message
      Rails.logger.error("Geocoder::NetworkError: #{e.message}. Failed to geocode batch #{batch_number} of #{total_batches}")

      # Include the timestamp in the log message
      Rails.logger.error("Geocoder::NetworkError: #{e.message}. Timestamp: #{Time.now}")

      # Include additional context about the error
      Rails.logger.error("Geocoder::NetworkError: #{e.message}. Error occurred while accessing the Geocoding API.")

    end
  end
end


# clearing the database
puts "Cleaning database"
ParkingBay.destroy_all

# creating parking bays from melbourne open data
URL = "https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=100&facet=status&facet=parking_zone&facet=last_updated"

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
