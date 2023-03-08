class TripsController < ApplicationController
  def show
    @trip = Trip.find(params[:id])
  end

  def new
    @trip = Trip.new
    @parking_bay = ParkingBay.find(params[:parking_bay_id])
  end

  def create
    @trip = Trip.new(trip_params)
    @parking_bay = ParkingBay.find(params[:parking_bay_id])
    @trip.parking_bay = @parking_bay

    if @trip.save
      redirect_to root_path
    else
      render :new
    end
  end

  private

  def trip_params
    params.require(:trip).permit(:timer)
  end
end
