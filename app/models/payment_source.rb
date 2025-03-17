class PaymentSource < ApplicationRecord
  PAYMENT_TYPE = ["credit card", "debit card", "cash"]

  has_many :transactions

  validate :validate_payment_source

  def validate_payment_source
    validate_name(:name, "Payment source")
    validate_uniqueness(:name)
  end

end