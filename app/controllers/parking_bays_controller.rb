class ParkingBaysController < ApplicationController
  def index
    @search = params["search"]
    if @search.present?
      @address = @search["address"]
      @parking_bays = ParkingBay.where("address ILIKE ?", "%#{@address}%")
    else
      @parking_bays = ParkingBay.all
    end

    @geojson = build_geojson

    UpdateParkingBayOccupiedStatusJob.perform_now # updates parking bay occupied status if the status has changed
  end

  def show
    @parking_bay = ParkingBay.find(params[:id])
  end

  private

  def build_geojson
    {
      type: "FeatureCollection",
      features: @parking_bays.map{|pb| to_feature(pb)}
    }
  end

  def to_feature(parking_bay)
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": parking_bay.coordinates
      },
      "properties": {
        "parking_bay_id": parking_bay.id,
        "address": parking_bay.address,
        "occupied": parking_bay.occupied,
        "color": parking_bay.occupied ? "red" : "green",
        "info_window": render_to_string(
          partial: "parking_bays/info_window",
          locals: { parking_bay: parking_bay }
        )
      }
    }
  end

end
