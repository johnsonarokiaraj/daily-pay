module ApplicationHelper
  def active_class(path)
    'active' if current_page?(path)
  end

  def active_class_condition(condition)
    'active' if condition
  end

end
