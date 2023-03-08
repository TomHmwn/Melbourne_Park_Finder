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
      features: @parking_bays.map(&:to_feature)
    }
  end
end
