class Trip < ApplicationRecord
  belongs_to :parking_bay

  validates :hours, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :minutes, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 60 }
end
