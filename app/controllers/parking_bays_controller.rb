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
    # @markers = @parking_bays.geocoded.map do |parking_bay|
    #   {
    #     lat: parking_bay.latitude,
    #     lng: parking_bay.longitude,
    #     info_window_html: render_to_string(partial: "info_window", locals: {parking_bay: parking_bay}),
    #     marker_html: render_to_string(partial: "marker", locals: {parking_bay: parking_bay})
    #   }
    @geojson = build_geojson
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
