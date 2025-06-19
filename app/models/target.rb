# == Schema Information
#
# Table name: targets
#
#  id           :bigint           not null, primary key
#  view_id      :bigint           not null
#  target_type  :string           not null # 'credit', 'debit', or 'balance'
#  target_value :decimal(15, 2)   not null
#  target_date  :date             not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class Target < ApplicationRecord
  belongs_to :view

  enum target_type: { credit: 'credit', debit: 'debit', balance: 'balance' }

  validates :target_type, presence: true, inclusion: { in: target_types.keys }
  validates :value, presence: true, numericality: true
  validates :target_date, presence: true
  validates :view_id, presence: true

  # Returns chart data for the target (balance/credit/debit over time)
  def self.progress_data_for(target)
    view = target.view
    filters = view.parsed_filters
    start_date = (filters['start_date'] ? Date.strptime(filters['start_date'], '%d-%m-%Y') : (target.target_date - 30))
    end_date = target.target_date
    dates = (start_date..end_date).to_a
    data = dates.map do |date|
      tx_scope = Transaction.all
      if filters['start_date']
        tx_scope = tx_scope.where('transaction_date >= ?', Date.strptime(filters['start_date'], '%d-%m-%Y'))
      end
      if filters['end_date']
        tx_scope = tx_scope.where('transaction_date <= ?', Date.strptime(filters['end_date'], '%d-%m-%Y'))
      end
      if filters['tag_list']
        tags = filters['tag_list'].split(',')
        tx_scope = tx_scope.tagged_with(tags)
      end
      tx_scope = tx_scope.where('transaction_date <= ?', date)
      credit = tx_scope.where(is_credit: true).sum(:amount)
      debit = tx_scope.where(is_credit: false).sum(:amount)
      balance = credit - debit
      {
        date: date,
        credit: credit,
        debit: debit,
        balance: balance
      }
    end
    {
      target: {
        id: target.id,
        type: target.target_type,
        value: target.value,
        date: target.target_date
      },
      data: data
    }
  end
end
