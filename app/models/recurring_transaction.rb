class RecurringTransaction < ApplicationRecord
  serialize :tags, JSON

  validates :name, :amount, :schedule_type, presence: true
  validates :schedule_type, inclusion: { in: %w[monthly weekly yearly] }
  validates :day_of_month, inclusion: { in: 1..31 }, allow_nil: true
  validates :weekday, inclusion: { in: 0..6 }, allow_nil: true
  validates :month_of_year, inclusion: { in: 1..12 }, allow_nil: true

  before_validation :set_initial_next_run

  scope :active, -> { where(active: true) }

  def set_initial_next_run
    self.next_run_on ||= compute_next_run(Date.current)
  end

  def due?(date = Date.current)
    active && next_run_on.present? && next_run_on <= date
  end

  def run!
    run_date = next_run_on || Date.current

    tx = Transaction.create!(
      name: name,
      amount: amount,
      is_credit: is_credit,
      transaction_date: run_date,
      tag_list: (tags || [])
    )

    self.last_run_on = run_date
    # Advance next_run_on to the next occurrence after run_date
    self.next_run_on = compute_next_run(run_date + 1.day)
    save!

    tx
  end

  def skip!
    base_date = next_run_on || Date.current
    self.next_run_on = compute_next_run(base_date + 1.day)
    save!
  end

  def schedule_human
    case schedule_type
    when 'monthly'
      d = day_of_month || 1
      "Monthly on #{ordinal(d)}"
    when 'weekly'
      %w[Sunday Monday Tuesday Wednesday Thursday Friday Saturday][weekday || 0].then { |w| "Weekly on #{w}" }
    when 'yearly'
      m = month_of_year || 1
      d = day_of_month || 1
      month_name = Date::MONTHNAMES[m]
      "Yearly on #{month_name} #{ordinal(d)}"
    else
      'Custom'
    end
  end

  def self.run_due!(date = Date.current)
    active.where('next_run_on <= ?', date).find_each(&:run!)
  end

  def compute_next_run(from_date)
    case schedule_type
    when 'monthly'
      target_day = (day_of_month || from_date.day).to_i
      # Use this month if target_day is >= from_date.day, else next month
      target_month_date = (from_date.day <= target_day) ? from_date : (from_date >> 1)
      y = target_month_date.year
      m = target_month_date.month
      Date.new(y, m, [target_day, last_day_of_month(y, m)].min)
    when 'weekly'
      w = (weekday || from_date.wday).to_i
      days_ahead = (w - from_date.wday) % 7
      from_date + days_ahead
    when 'yearly'
      m = (month_of_year || from_date.month).to_i
      d = (day_of_month || from_date.day).to_i
      candidate = safe_date(from_date.year, m, d)
      candidate < from_date ? safe_date(from_date.year + 1, m, d) : candidate
    else
      from_date
    end
  end

  private

  def last_day_of_month(year, month)
    Date.civil(year, month, -1).day
  end

  def safe_date(year, month, day)
    Date.new(year, month, [day, last_day_of_month(year, month)].min)
  end

  def ordinal(num)
    abs = num.to_i.abs
    return "#{num}th" if (11..13).include?(abs % 100)
    case abs % 10
    when 1 then "#{num}st"
    when 2 then "#{num}nd"
    when 3 then "#{num}rd"
    else "#{num}th"
    end
  end
end
