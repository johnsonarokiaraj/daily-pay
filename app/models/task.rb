class Task < ApplicationRecord
  belongs_to :task_section
  has_many :comments, dependent: :destroy

  validates :name, presence: true
  validates :task_id, presence: true, uniqueness: true
  validates :status, inclusion: { in: %w[pending in_progress completed cancelled archive] }
  validates :completion_date, presence: true

  scope :ordered, -> { order(:position, :created_at) }
  scope :pending, -> { where(status: 'pending') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :overdue, -> { where('completion_date < ? AND status != ?', Date.current, 'completed') }

  before_validation :generate_task_id, on: :create

  def days_remaining
    return 0 if completed? || completion_date.nil?

    days = (completion_date - Date.current).to_i
    days < 0 ? 0 : days
  end

  def time_status
    return 'completed' if completed?

    days = days_remaining
    if days == 0
      'due_today'
    elsif days < 0
      'overdue'
    elsif days <= 3
      'urgent'
    else
      'normal'
    end
  end

  def status_color
    case status
    when 'completed'
      'success'
    when 'in_progress'
      'processing'
    when 'cancelled'
      'error'
    else
      case time_status
      when 'overdue'
        'error'
      when 'due_today', 'urgent'
        'warning'
      else
        'default'
      end
    end
  end

  def completed?
    status == 'completed'
  end

  private

  def generate_task_id
    return if task_id.present?
    self.task_id = task_section.generate_task_id
  end
end
