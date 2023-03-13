class Trip < ApplicationRecord
  belongs_to :parking_bay

  validate :only_one_field_can_be_zero

  validates :hours, presence: true
  validates :hours, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 24, message: "Must be between 0 and 23" }
  validates :minutes, presence: true
  validates :minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than: 60, message: "Must be between 0 and 59" }

  def only_one_field_can_be_zero
    # Get the values of all input fields
    input_values = [hours, minutes]

    # Count the number of fields that are zero
    num_zeros = input_values.count(0)

    # If more than one field is zero, add an error message to the model
    if num_zeros > 1
      errors.add(:base, "Only one input field can be zero")
    end
  end
end
