class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # Constants for regex patterns
  NAME_REGEX = /\A(?=.*[a-zA-Z])[\w\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*\z/
  ONLY_NUMBERS_REGEX = /\A\d+\z/

  # Validation methods with custom error messages
  def validate_name(attribute, custom_label)
    value = send(attribute)
    if value.blank?
      errors.add(:base, "#{custom_label} cannot be blank") # Use :base to avoid "Name" prefix
    elsif value.length < 3
      errors.add(:base, "#{custom_label} should be at least 3 characters long")
    elsif !value.match?(NAME_REGEX)
      errors.add(:base, "#{custom_label} should only contain letters")
    end
  end

  def validate_limit(attribute, custom_label)
    value = send(attribute)
    if value.blank?
      errors.add(:base, "#{custom_label} cannot be blank")
    elsif !value.to_s.match?(ONLY_NUMBERS_REGEX)
      errors.add(:base, "#{custom_label} must be a valid number with up to 2 decimal places")
    end
  end

  def validate_uniqueness(attribute)
    value = send(attribute)
    if self.class.exists?(name: name)
      errors.add(:base, "#{name} already exists in the system")
    end
  end
end
