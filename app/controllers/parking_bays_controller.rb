class ParkingBaysController < ApplicationController
  def index
    @parking_bays = ParkingBay.all
  end
end
