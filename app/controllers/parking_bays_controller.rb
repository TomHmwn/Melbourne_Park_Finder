require 'open-uri'

class ParkingBaysController < ApplicationController
  def index
    # @parking_bays = ParkingBay.where.not(latitude: nil, longitude: nil)
    @search = params["search"]
    if @search.present?
      @address = @search["address"]
      @parking_bays = ParkingBay.where("address ILIKE ?", "%#{@address}%")
    else
      @parking_bays = ParkingBay.all
    end

    # update the sensorLastUpdated attribute for every refresh
    url = 'https://data.melbourne.vic.gov.au/api/records/1.0/search/?dataset=on-street-parking-bay-sensors&q=&rows=500&facet=status&facet=parking_zone&facet=last_updated'
    html = URI.open(url).read
    doc = JSON.parse(html)
    doc['records'].map do |record|
      matched_localsaved_parking_bay = ParkingBay.find_by(st_marker_id: record['fields']['st_marker_id'])
      record['fields']['status'] == 'Present' ? incoming_occupied_value = true : incoming_occupied_value = false
      if incoming_occupied_value != matched_localsaved_parking_bay.occupied
        ParkingBay.update!(
          occupied:,
          sensorLastUpdated: record['fields']['last_updated']
        )
      end
    end

    @geojson = build_geojson
  end

  def show
    @parking_bay = ParkingBay.find(params[:id])
  end

  private

  def build_geojson
    {
      type: "FeatureCollection",
      features: @parking_bays.map(&:to_feature)
    }
  end
end
