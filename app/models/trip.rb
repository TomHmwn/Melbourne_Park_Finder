class Trip < ApplicationRecord
  belongs_to :parking_bay

  validates :timer, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
end
