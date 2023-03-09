class Trip < ApplicationRecord
  belongs_to :parking_bay

  validates :timer, presence: true, numericality: { only_integer: true }
end
