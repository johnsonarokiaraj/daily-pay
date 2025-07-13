class TaskSection < ApplicationRecord
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :abbreviation, presence: true, uniqueness: true,
            format: { with: /\A[A-Z]{2,10}\z/, message: "must be 2-10 uppercase letters" }

  scope :ordered, -> { order(:position, :name) }

  before_validation :upcase_abbreviation

  def next_task_number
    last_task = tasks.where("task_id LIKE ?", "#{abbreviation}-%")
                    .order(Arel.sql("CAST(SUBSTR(task_id, #{abbreviation.length + 2}) AS INTEGER) DESC"))
                    .first

    if last_task
      last_number = last_task.task_id.split('-').last.to_i
      last_number + 1
    else
      1
    end
  end

  def generate_task_id
    "#{abbreviation}-#{next_task_number}"
  end

  private

  def upcase_abbreviation
    self.abbreviation = abbreviation&.upcase
  end
end

