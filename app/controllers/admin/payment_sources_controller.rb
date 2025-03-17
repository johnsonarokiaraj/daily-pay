class Admin::PaymentSourcesController < ApplicationController
  def index
    @payment_sources = PaymentSource.all
  end

  def create
    @payment_source = PaymentSource.new(payment_source_params)
    msg = @payment_source.save ? { notice: "Payment source added successfully." } : { alert: @payment_source.errors.full_messages[0] }

    redirect_to admin_payment_sources_path, **msg
  end

  private

  def payment_source_params
    params.require(:payment_source).permit(:name, :payment_type)
  end
end
