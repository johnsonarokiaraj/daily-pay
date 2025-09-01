class Api::RecurringTransactionsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    recs = RecurringTransaction.order(:next_run_on)
    render json: { recurring_transactions: recs.map { |r| recurring_json(r) } }
  end

  def create
    rec = RecurringTransaction.new(recurring_params)
    if rec.save
      render json: { status: 'success', recurring_transaction: recurring_json(rec) }
    else
      render json: { status: 'error', errors: rec.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    rec = RecurringTransaction.find(params[:id])
    if rec.update(recurring_params)
      render json: { status: 'success', recurring_transaction: recurring_json(rec) }
    else
      render json: { status: 'error', errors: rec.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    rec = RecurringTransaction.find(params[:id])
    if rec.destroy
      render json: { status: 'success' }
    else
      render json: { status: 'error' }, status: :unprocessable_entity
    end
  end

  def run_due
    RecurringTransaction.run_due!
    head :ok
  end

  private

  def recurring_json(rec)
    {
      id: rec.id,
      name: rec.name,
      amount: rec.amount,
      is_credit: rec.is_credit,
      schedule_type: rec.schedule_type,
      day_of_month: rec.day_of_month,
      weekday: rec.weekday,
      month_of_year: rec.month_of_year,
      next_run_on: rec.next_run_on&.to_s,
      last_run_on: rec.last_run_on&.to_s,
      active: rec.active,
      tags: Array(rec.tags),
      schedule_human: rec.schedule_human
    }
  end

  def recurring_params
    params.require(:recurring_transaction).permit(
      :name, :amount, :is_credit,
      :schedule_type, :day_of_month, :weekday, :month_of_year,
      :next_run_on, :active,
      tags: []
    )
  end
end
