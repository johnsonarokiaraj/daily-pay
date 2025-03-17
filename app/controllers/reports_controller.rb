class ReportsController < ApplicationController
  def index
    report_1 = Transaction.joins(:payment_source).group("payment_sources.name").sum(:amount)
    report_2 = Transaction.joins(:spent_category).group("spent_categories.name").sum(:amount)
    report_3 = Transaction.joins(:member).group("members.name").sum(:amount)
    @payment_sources = report_1.map { |key, value| { key: key, value: value } }
    @spent_categories = report_2.map { |key, value| { key: key, value: value } }
    @members = report_3.map { |key, value| { key: key, value: value } }
  end
end
