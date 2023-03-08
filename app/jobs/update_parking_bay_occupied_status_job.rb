require 'open-uri'

class UpdateParkingBayOccupiedStatusJob < ApplicationJob
  queue_as :default

  def perform
    url = 'https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=500&facet=status&facet=parking_zone&facet=last_updated'
    puts 'Parsing Melbourne parking data...'
    html = URI.open(url).read
    doc = JSON.parse(html)
    doc['records'].each do |record|
      puts 'Updating parking bay status if the status has changed...'
      matching_locallysaved_parking_bay = ParkingBay.find_by(st_marker_id: record['fields']['st_marker_id'])
      # puts matching_locallysaved_parking_bay
      # record['fields']['status'] == 'Present' ? incoming_occupied_value = true : incoming_occupied_value = false
      occupied = (record['fields']['status'] == 'Present')
      next unless occupied != matching_locallysaved_parking_bay.occupied

      # matching_locallysaved_parking_bay.occupied = occupied
      # matching_locallysaved_parking_bay.sensorLastUpdated = record['fields']['last_updated']
      # matching_locallysaved_parking_bay.save!
      matching_locallysaved_parking_bay.update_columns(
        occupied: occupied,
        sensorLastUpdated: record['fields']['last_updated']
      )
      puts "Parking bay #{matching_locallysaved_parking_bay.id} status was updated to #{occupied}"
    end
    'success'
  end
end
