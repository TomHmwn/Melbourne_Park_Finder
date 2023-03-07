class Trip < ApplicationRecord
  belongs_to :user
  belongs_to :parking_bay
end
