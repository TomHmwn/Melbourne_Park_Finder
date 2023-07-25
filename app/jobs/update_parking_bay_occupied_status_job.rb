require 'open-uri'

class UpdateParkingBayOccupiedStatusJob < ApplicationJob
  queue_as :default

  def perform
    url = 'https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=4390&facet=status&facet=parking_zone&facet=last_updated'
    puts 'Parsing Melbourne parking data...'

    begin
      html = URI.open(url).read
      doc = JSON.parse(html)

      doc['records'].each do |record|
        puts 'Updating parking bay status if the status has changed...'
        parking_bay_id = record['fields']['parkingbay_id']
        occupied = (record['fields']['status_description'] == 'Present')

        matching_locallysaved_parking_bay = ParkingBay.find_by(parkingbay_id: parking_bay_id)

        if matching_locallysaved_parking_bay
          matching_locallysaved_parking_bay.update(
            occupied: occupied,
            sensorLastUpdated: record['fields']['lastupdated']
          )
          puts "Parking bay #{matching_locallysaved_parking_bay.id} status was updated to #{occupied}"
        else
          puts "Parking bay with parkingbay_id #{parking_bay_id} not found."
        end
      end

      puts 'Data parsing and update complete.'
    rescue StandardError => e
      puts "An error occurred: #{e.message}"
    end

    'success' # This return value is not being used here, but you can use it if needed.
  end
end
